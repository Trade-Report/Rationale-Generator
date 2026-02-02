from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from utils.database import Base

class Sheet(Base):
    __tablename__ = "sheets"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    file_name = Column(String, nullable=False)
    upload_date = Column(String, nullable=False)  # YYYY-MM-DD format
    rows_data = Column(JSON, nullable=False)  # Store the Excel rows as JSON
    processed_rows = Column(JSON, default=list)  # Array of row indices that have been processed
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to row rationales
    row_rationales = relationship("RowRationale", back_populates="sheet", cascade="all, delete-orphan")

class RowRationale(Base):
    __tablename__ = "row_rationales"

    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(Integer, ForeignKey("sheets.id"), nullable=False)
    row_index = Column(Integer, nullable=False)  # The row index in the sheet
    rationale_text = Column(Text, nullable=False)  # The technical commentary
    rationale_result = Column(JSON)  # Full API response stored as JSON
    image_preview = Column(Text)  # Base64 encoded image
    editable_rationale = Column(Text)  # Editable version of rationale
    generated_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to sheet
    sheet = relationship("Sheet", back_populates="row_rationales")

