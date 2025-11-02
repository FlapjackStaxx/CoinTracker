from __future__ import annotations

from typing import Any, Iterable, Optional

from sqlalchemy.orm import Session

from . import schemas
from .models import CurrencyItem


def _model_dump(model: Any, *, exclude_unset: bool = False) -> dict:
    """Return a plain dict from a Pydantic model for v1/v2 compatibility."""

    dump_method = getattr(model, "model_dump", None)
    if callable(dump_method):
        return dump_method(exclude_unset=exclude_unset)
    return model.dict(exclude_unset=exclude_unset)


def list_items(db: Session) -> Iterable[CurrencyItem]:
    return db.query(CurrencyItem).order_by(CurrencyItem.created_at.desc()).all()


def get_item(db: Session, item_id: int) -> Optional[CurrencyItem]:
    return db.query(CurrencyItem).filter(CurrencyItem.id == item_id).first()


def create_item(db: Session, item: schemas.CurrencyCreate) -> CurrencyItem:
    db_item = CurrencyItem(**_model_dump(item))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, db_item: CurrencyItem, update: schemas.CurrencyUpdate) -> CurrencyItem:
    for field, value in _model_dump(update, exclude_unset=True).items():
        setattr(db_item, field, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, db_item: CurrencyItem) -> None:
    db.delete(db_item)
    db.commit()

