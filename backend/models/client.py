from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from utils.database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    
    usage = relationship("Usage", back_populates="client", cascade="all, delete-orphan")
