# backend/crud.py
from sqlalchemy.orm import Session
from models import Subscription
from schemas import SubscriptionCreate

def create_subscription(db: Session, sub_in: SubscriptionCreate) -> Subscription:
    db_sub = Subscription(**sub_in.model_dump())
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

def list_subscriptions(db: Session) -> list[Subscription]:
    return db.query(Subscription).all()

def get_subscription(db: Session, sub_id: int) -> Subscription | None:
    return db.query(Subscription).filter(Subscription.id == sub_id).first()

def update_subscription(db: Session, sub_id: int, sub_in: SubscriptionCreate) -> Subscription | None:
    db_sub = get_subscription(db, sub_id)
    if not db_sub:
        return None
    for k, v in sub_in.model_dump().items():
        setattr(db_sub, k, v)
    db.commit()
    db.refresh(db_sub)
    return db_sub

def delete_subscription(db: Session, sub_id: int) -> bool:
    db_sub = get_subscription(db, sub_id)
    if not db_sub:
        return False
    db.delete(db_sub)
    db.commit()
    return True
