from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Usage(Base):
    __tablename__ = "usage"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    action = Column(String)
    tokens_used = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    
    client = relationship("Client", back_populates="usage")
