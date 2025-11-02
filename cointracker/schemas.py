from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from .models import AcquisitionStatus


class CurrencyBase(BaseModel):
    name: str = Field(..., max_length=200)
    country: str = Field(..., max_length=100)
    denomination: str = Field(..., max_length=100)
    year: Optional[int] = Field(None, ge=0, le=2100)
    catalog_reference: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    estimated_value: Optional[float] = Field(None, ge=0)
    market_value: Optional[float] = Field(None, ge=0)
    status: AcquisitionStatus = Field(default=AcquisitionStatus.OWNED)
    notes: Optional[str] = None
    image_path: Optional[str] = None


class CurrencyCreate(CurrencyBase):
    pass


class CurrencyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    country: Optional[str] = Field(None, max_length=100)
    denomination: Optional[str] = Field(None, max_length=100)
    year: Optional[int] = Field(None, ge=0, le=2100)
    catalog_reference: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    estimated_value: Optional[float] = Field(None, ge=0)
    market_value: Optional[float] = Field(None, ge=0)
    status: Optional[AcquisitionStatus] = None
    notes: Optional[str] = None
    image_path: Optional[str] = None


class Currency(CurrencyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class RecognitionResult(BaseModel):
    probable_match: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)
    notes: Optional[str] = None


class RecognitionRequest(BaseModel):
    filename: str
    mime_type: str

