from pydantic import BaseModel
from typing import List

class UsageItem(BaseModel):
    action: str
    tokens_used: int

class UsageCreate(BaseModel):
    client_id: int
    usage: List[UsageItem]
