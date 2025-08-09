# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Subscription
from schemas import SubscriptionCreate, SubscriptionRead
import crud  # <-- new

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/subscriptions", response_model=SubscriptionRead)
def add_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    return crud.create_subscription(db, payload)

@app.get("/subscriptions", response_model=list[SubscriptionRead])
def get_subscriptions(db: Session = Depends(get_db)):
    return crud.list_subscriptions(db)

@app.put("/subscriptions/{sub_id}", response_model=SubscriptionRead)
def update_sub(sub_id: int, payload: SubscriptionCreate, db: Session = Depends(get_db)):
    updated = crud.update_subscription(db, sub_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return updated

@app.delete("/subscriptions/{sub_id}")
def delete_sub(sub_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_subscription(db, sub_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"ok": True}
