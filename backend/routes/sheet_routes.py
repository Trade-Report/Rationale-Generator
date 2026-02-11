from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from utils.database import get_db
from models.sheet import Sheet, RowRationale
from schemas.sheet import (
    SheetCreate, SheetResponse, SheetListResponse,
    RowRationaleCreate, RowRationaleUpdate, RowRationaleResponse
)
from utils.auth import get_current_user_id

router = APIRouter(prefix="/sheets", tags=["sheets"])

# Sheet CRUD Operations
@router.post("", response_model=SheetResponse, status_code=201)
def create_sheet(
    sheet_data: SheetCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create a new sheet for the current user"""
    db_sheet = Sheet(
        client_id=user_id,
        file_name=sheet_data.file_name,
        upload_date=sheet_data.upload_date,
        rows_data=sheet_data.rows_data,
        processed_rows=sheet_data.processed_rows or []
    )
    db.add(db_sheet)
    db.commit()
    db.refresh(db_sheet)
    return db_sheet

@router.get("", response_model=SheetListResponse)
def get_all_sheets(
    date_filter: Optional[str] = Query(None, description="Filter by upload date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get all sheets for the current user, optionally filtered by date"""
    query = db.query(Sheet).filter(Sheet.client_id == user_id)
    
    if date_filter:
        query = query.filter(Sheet.upload_date == date_filter)
    
    sheets = query.order_by(Sheet.created_at.desc()).all()
    
    return SheetListResponse(
        sheets=[SheetResponse.model_validate(sheet) for sheet in sheets],
        total=len(sheets)
    )

@router.get("/{sheet_id}", response_model=SheetResponse)
def get_sheet(
    sheet_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get a specific sheet by ID"""
    sheet = db.query(Sheet).filter(
        Sheet.id == sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    return sheet

@router.put("/{sheet_id}/processed-rows", response_model=SheetResponse)
def update_processed_rows(
    sheet_id: int,
    processed_rows: List[int],
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Update the processed rows for a sheet"""
    sheet = db.query(Sheet).filter(
        Sheet.id == sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    sheet.processed_rows = processed_rows
    db.commit()
    db.refresh(sheet)
    return sheet

@router.delete("/{sheet_id}", status_code=204)
def delete_sheet(
    sheet_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Delete a sheet and all its row rationales"""
    sheet = db.query(Sheet).filter(
        Sheet.id == sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    db.delete(sheet)
    db.commit()
    return None

# Row Rationale Operations
@router.post("/rationales", response_model=RowRationaleResponse, status_code=201)
def create_row_rationale(
    rationale_data: RowRationaleCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create or update a row rationale"""
    # Verify sheet belongs to user
    sheet = db.query(Sheet).filter(
        Sheet.id == rationale_data.sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    # Check if rationale already exists for this row
    existing = db.query(RowRationale).filter(
        RowRationale.sheet_id == rationale_data.sheet_id,
        RowRationale.row_index == rationale_data.row_index
    ).first()
    
    if existing:
        # Update existing
        existing.rationale_text = rationale_data.rationale_text
        existing.rationale_result = rationale_data.rationale_result
        existing.image_preview = rationale_data.image_preview
        existing.editable_rationale = rationale_data.editable_rationale or rationale_data.rationale_text
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new
        db_rationale = RowRationale(
            sheet_id=rationale_data.sheet_id,
            row_index=rationale_data.row_index,
            rationale_text=rationale_data.rationale_text,
            rationale_result=rationale_data.rationale_result,
            image_preview=rationale_data.image_preview,
            editable_rationale=rationale_data.editable_rationale or rationale_data.rationale_text
        )
        db.add(db_rationale)
        
        # Update sheet's processed rows
        if rationale_data.row_index not in sheet.processed_rows:
            sheet.processed_rows.append(rationale_data.row_index)
        
        db.commit()
        db.refresh(db_rationale)
        return db_rationale

@router.get("/rationales/{sheet_id}/{row_index}", response_model=RowRationaleResponse)
def get_row_rationale(
    sheet_id: int,
    row_index: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get rationale for a specific row"""
    # Verify sheet belongs to user
    sheet = db.query(Sheet).filter(
        Sheet.id == sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    rationale = db.query(RowRationale).filter(
        RowRationale.sheet_id == sheet_id,
        RowRationale.row_index == row_index
    ).first()
    
    if not rationale:
        raise HTTPException(status_code=404, detail="Rationale not found for this row")
    
    return rationale

@router.get("/rationales/sheet/{sheet_id}", response_model=List[RowRationaleResponse])
def get_all_rationales_for_sheet(
    sheet_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get all rationales for a specific sheet"""
    # Verify sheet belongs to user
    sheet = db.query(Sheet).filter(
        Sheet.id == sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    
    rationales = db.query(RowRationale).filter(
        RowRationale.sheet_id == sheet_id
    ).all()
    
    return rationales

@router.put("/rationales/{rationale_id}", response_model=RowRationaleResponse)
def update_row_rationale(
    rationale_id: int,
    rationale_data: RowRationaleUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Update a row rationale"""
    rationale = db.query(RowRationale).filter(RowRationale.id == rationale_id).first()
    
    if not rationale:
        raise HTTPException(status_code=404, detail="Rationale not found")
    
    # Verify sheet belongs to user
    sheet = db.query(Sheet).filter(
        Sheet.id == rationale.sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    if rationale_data.rationale_text is not None:
        rationale.rationale_text = rationale_data.rationale_text
    if rationale_data.rationale_result is not None:
        rationale.rationale_result = rationale_data.rationale_result
    if rationale_data.image_preview is not None:
        rationale.image_preview = rationale_data.image_preview
    if rationale_data.editable_rationale is not None:
        rationale.editable_rationale = rationale_data.editable_rationale
    
    db.commit()
    db.refresh(rationale)
    return rationale

@router.delete("/rationales/{rationale_id}", status_code=204)
def delete_row_rationale(
    rationale_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Delete a row rationale"""
    rationale = db.query(RowRationale).filter(RowRationale.id == rationale_id).first()
    
    if not rationale:
        raise HTTPException(status_code=404, detail="Rationale not found")
    
    # Verify sheet belongs to user
    sheet = db.query(Sheet).filter(
        Sheet.id == rationale.sheet_id,
        Sheet.client_id == user_id
    ).first()
    
    if not sheet:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Remove from processed rows
    if rationale.row_index in sheet.processed_rows:
        sheet.processed_rows.remove(rationale.row_index)
    
    db.delete(rationale)
    db.commit()
    return None

