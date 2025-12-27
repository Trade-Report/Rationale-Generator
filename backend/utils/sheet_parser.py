import pandas as pd
from fastapi import UploadFile


def parse_sheet_to_key_value(file: UploadFile) -> dict:
    """
    Reads Excel/CSV and converts:
    Column name → first row value
    """
    if file.filename.endswith(".xlsx"):
        df = pd.read_excel(file.file)
    elif file.filename.endswith(".csv"):
        df = pd.read_csv(file.file)
    else:
        raise ValueError("Only Excel (.xlsx) or CSV allowed")

    if df.empty:
        raise ValueError("Uploaded sheet is empty")

    # Take first row as values
    row = df.iloc[0]

    data = {}
    for col in df.columns:
        value = row[col]

        # Handle NaN
        if pd.isna(value):
            continue

        data[col] = str(value)

    return data
