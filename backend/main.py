from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from datetime import date
from database import Base, engine
from models import Subscription
from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal

Base.metadata.create_all(bind=engine)


app = FastAPI()

class Subscription(BaseModel):
    name: str
    cost: float
    renewal_date: date
    frequency: str  # e.g., "monthly", "annually"
    category: Optional[str] = "Uncategorized"  # AI can auto-fill this later

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/subscriptions")
def add_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db)):
    db_subscription = Subscription(**subscription.dict())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

@app.get("/subscriptions")
def get_subscriptions(db: Session = Depends(get_db)):
    subscriptions = db.query(Subscription).all()
    return subscriptions

