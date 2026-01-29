from pydantic import BaseModel

class ClientCreate(BaseModel):
    username: str
    password: str
