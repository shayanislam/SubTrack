from collections import defaultdict

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Subscription
from schemas import SubscriptionCreate, SubscriptionRead
import crud

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SubTrack API")

# Allow the React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Optional: simple health/root route
@app.get("/")
def root():
    return {"status": "ok", "service": "SubTrack API"}

# ---------- CRUD: Subscriptions ----------

# Create
@app.post("/subscriptions", response_model=SubscriptionRead)
def add_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    return crud.create_subscription(db, payload)

# Read all
@app.get("/subscriptions", response_model=list[SubscriptionRead])
def get_subscriptions(db: Session = Depends(get_db)):
    return crud.list_subscriptions(db)

# Update (replace all fields)
@app.put("/subscriptions/{sub_id}", response_model=SubscriptionRead)
def update_subscription(sub_id: int, payload: SubscriptionCreate, db: Session = Depends(get_db)):
    updated = crud.update_subscription(db, sub_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return updated

# Delete
@app.delete("/subscriptions/{sub_id}")
def delete_subscription(sub_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_subscription(db, sub_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"ok": True}

# ---------- Summary ----------

def _monthly_cost(sub: Subscription) -> float:
    """
    Convert different billing cadences into a monthly-equivalent cost.
    """
    freq = (sub.frequency or "").strip().lower()
    periods_per_year = {
        "monthly": 12,
        "annual": 1,
        "yearly": 1,
        "quarterly": 4,
        "semiannual": 2,
        "biweekly": 26,
        "weekly": 52,
        "every_4_weeks": 13,
    }.get(freq, 12)  # default to monthly if unknown
    return float(sub.cost) * (periods_per_year / 12.0)

@app.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    subs = db.query(Subscription).all()
    total = 0.0
    by_cat = defaultdict(float)

    for s in subs:
        m = _monthly_cost(s)
        total += m
        by_cat[(s.category or "Uncategorized")] += m

    return {
        "total_monthly": total,
        "by_category": dict(by_cat),
        "count": len(subs),
    }
