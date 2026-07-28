from typing import Optional
from pydantic import BaseModel

class CameraBase(BaseModel):
    name: str
    rtsp_url: Optional[str] = None
    location: str
    is_active: bool = True
    status: str = "Offline"

class CameraCreate(BaseModel):
    name: str
    rtsp_url: Optional[str] = None
    location: str

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    rtsp_url: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None

class CameraResponse(CameraBase):
    id: int

    class Config:
        from_attributes = True
