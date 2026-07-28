from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.camera import CameraResponse

class IncidentBase(BaseModel):
    camera_id: int
    ppe_violation_types: Optional[str] = None
    snapshot_url: Optional[str] = None
    severity: str = "Low"
    status: str = "Pending"

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: int
    timestamp: datetime
    camera: Optional[CameraResponse] = None

    class Config:
        from_attributes = True
