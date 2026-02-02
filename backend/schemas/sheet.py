from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# Sheet Schemas
class SheetCreate(BaseModel):
    file_name: str
    upload_date: str  # YYYY-MM-DD format
    rows_data: List[Dict[str, Any]]  # Excel rows as list of dictionaries
    processed_rows: Optional[List[int]] = []

class SheetResponse(BaseModel):
    id: int
    client_id: int
    file_name: str
    upload_date: str
    rows_data: List[Dict[str, Any]]
    processed_rows: List[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class SheetListResponse(BaseModel):
    sheets: List[SheetResponse]
    total: int

# Row Rationale Schemas
class RowRationaleCreate(BaseModel):
    sheet_id: int
    row_index: int
    rationale_text: str
    rationale_result: Optional[Dict[str, Any]] = None
    image_preview: Optional[str] = None
    editable_rationale: Optional[str] = None

class RowRationaleUpdate(BaseModel):
    rationale_text: Optional[str] = None
    rationale_result: Optional[Dict[str, Any]] = None
    image_preview: Optional[str] = None
    editable_rationale: Optional[str] = None

class RowRationaleResponse(BaseModel):
    id: int
    sheet_id: int
    row_index: int
    rationale_text: str
    rationale_result: Optional[Dict[str, Any]] = None
    image_preview: Optional[str] = None
    editable_rationale: Optional[str] = None
    generated_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

