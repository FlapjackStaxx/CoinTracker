from __future__ import annotations

from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .camera import recognize_currency
from .database import engine
from .dependencies import get_db
from .models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CoinTracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/items", response_model=List[schemas.Currency])
def list_currency_items(db: Session = Depends(get_db)):
    return crud.list_items(db)


@app.post(
    "/items",
    response_model=schemas.Currency,
    status_code=status.HTTP_201_CREATED,
)
def create_currency_item(item: schemas.CurrencyCreate, db: Session = Depends(get_db)):
    created = crud.create_item(db, item)
    return created


@app.get("/items/{item_id}", response_model=schemas.Currency)
def get_currency_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item


@app.patch("/items/{item_id}", response_model=schemas.Currency)
def update_currency_item(
    item_id: int, update: schemas.CurrencyUpdate, db: Session = Depends(get_db)
):
    db_item = crud.get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = crud.update_item(db, db_item, update)
    return updated


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_currency_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    crud.delete_item(db, db_item)
    return None


@app.post("/recognize", response_model=schemas.RecognitionResult)
def recognize_currency_item(request: schemas.RecognitionRequest):
    return recognize_currency(request)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.get("/items/{item_id}/export")
def export_currency_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    output = {
        "name": db_item.name,
        "country": db_item.country,
        "denomination": db_item.denomination,
        "year": db_item.year,
        "description": db_item.description,
        "estimated_value": db_item.estimated_value,
        "market_value": db_item.market_value,
        "status": db_item.status,
        "notes": db_item.notes,
    }
    return output

