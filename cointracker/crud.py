from __future__ import annotations

from typing import Iterable, Optional

from sqlalchemy.orm import Session

from . import schemas
from .models import CurrencyItem


def list_items(db: Session) -> Iterable[CurrencyItem]:
    return db.query(CurrencyItem).order_by(CurrencyItem.created_at.desc()).all()


def get_item(db: Session, item_id: int) -> Optional[CurrencyItem]:
    return db.query(CurrencyItem).filter(CurrencyItem.id == item_id).first()


def create_item(db: Session, item: schemas.CurrencyCreate) -> CurrencyItem:
    db_item = CurrencyItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, db_item: CurrencyItem, update: schemas.CurrencyUpdate) -> CurrencyItem:
    for field, value in update.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, db_item: CurrencyItem) -> None:
    db.delete(db_item)
    db.commit()

