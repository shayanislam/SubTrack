from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from datetime import date

app = FastAPI()

class Subscription(BaseModel):
    name: str
    cost: float
    renewal_date: date
    frequency: str  # e.g., "monthly", "annually"
    category: Optional[str] = "Uncategorized"  # AI can auto-fill this later

# In-memory store for now (later we’ll use a real database)
subscriptions_db = []

@app.post("/subscriptions")
def add_subscription(subscription: Subscription):
    subscriptions_db.append(subscription)
    return {"message": "Subscription added", "data": subscription}

@app.get("/subscriptions")
def get_subscriptions():
    return {"subscriptions": subscriptions_db}
