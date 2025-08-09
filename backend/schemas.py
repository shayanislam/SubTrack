from datetime import date
from pydantic import BaseModel
from pydantic import ConfigDict  # pydantic v2; if on v1, delete this line

class SubscriptionCreate(BaseModel):
    name: str
    cost: float
    renewal_date: date
    frequency: str
    category: str

class SubscriptionRead(BaseModel):
    id: int
    name: str
    cost: float
    renewal_date: date
    frequency: str
    category: str

    # pydantic v2 only. If you're on pydantic v1, use Config class with orm_mode=True instead.
    model_config = ConfigDict(from_attributes=True)
