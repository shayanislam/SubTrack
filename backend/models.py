from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    cost = Column(Float)
    renewal_date = Column(Date)
    frequency = Column(String)
    category = Column(String)
