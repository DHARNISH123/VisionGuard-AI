from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ppe_violation_types = Column(String, nullable=True)  # Comma separated e.g. "helmet,vest"
    snapshot_url = Column(String, nullable=True)          # URL or local relative path to snapshot image
    severity = Column(String, default="Low")             # Low, Medium, High
    status = Column(String, default="Pending")           # Pending, Resolved, False Alarm

    camera = relationship("Camera", backref="incidents")
