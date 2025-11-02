from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class AcquisitionStatus(str):
    OWNED = "owned"
    SOLD = "sold"
    WISHLIST = "wishlist"


class CurrencyItem(Base):
    __tablename__ = "currency_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    country = Column(String(100), nullable=False)
    denomination = Column(String(100), nullable=False)
    year = Column(Integer, nullable=True)
    catalog_reference = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    estimated_value = Column(Float, nullable=True)
    market_value = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default=AcquisitionStatus.OWNED)
    notes = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


