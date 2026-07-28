from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    rtsp_url = Column(String, nullable=True)  # RTSP URL or video path/device index
    location = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    status = Column(String, default="Offline")  # Online, Offline, Alerting
