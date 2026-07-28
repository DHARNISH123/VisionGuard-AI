import os
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.config import settings
from app.core.security import RoleChecker
from app.models.incident import Incident
from app.models.camera import Camera
from app.schemas.incident import IncidentResponse, IncidentUpdate

router = APIRouter()
write_permission = Depends(RoleChecker(["Admin", "Supervisor"]))

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(
    camera_id: Optional[int] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Incident).options(joinedload(Incident.camera))
    
    if camera_id is not None:
        query = query.filter(Incident.camera_id == camera_id)
    if status is not None:
        query = query.filter(Incident.status == status)
    if severity is not None:
        query = query.filter(Incident.severity == severity)
    if location is not None:
        query = query.join(Camera).filter(Camera.location == location)
        
    return query.order_by(Incident.timestamp.desc()).offset(offset).limit(limit).all()

@router.put("/{incident_id}", response_model=IncidentResponse, dependencies=[write_permission])
def update_incident(incident_id: int, incident_in: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    update_data = incident_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)
        
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/stats")
def get_incident_stats(db: Session = Depends(get_db)):
    """
    Computes dashboard analytics: total cameras, total incidents, compliance rate,
    pending vs resolved counts, and recent weekly trend logs.
    """
    total_cameras = db.query(Camera).count()
    active_cameras = db.query(Camera).filter(Camera.is_active == True).count()
    total_incidents = db.query(Incident).count()
    pending_incidents = db.query(Incident).filter(Incident.status == "Pending").count()
    resolved_incidents = db.query(Incident).filter(Incident.status == "Resolved").count()
    
    # Calculate safety compliance rate:
    # A simple formula: 100 - (pending incidents ratio relative to active cameras) * 10
    # Bound it between 0% and 100%
    if active_cameras > 0:
        deduction = (pending_incidents / active_cameras) * 12
        compliance_rate = max(0, min(100, int(100 - deduction)))
    else:
        compliance_rate = 100
        
    # Weekly trend: past 7 days incident count grouped by date
    trend = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        count = db.query(Incident).filter(Incident.timestamp >= day_start, Incident.timestamp <= day_end).count()
        trend.append({
            "date": day.strftime("%b %d"),
            "count": count
        })
        
    # Severity distribution
    severity_counts = db.query(Incident.severity, func.count(Incident.id))\
        .group_by(Incident.severity).all()
    severity_dist = {sev: count for sev, count in severity_counts}
    
    # Gear violation counts (parse csv string)
    gear_counts = {}
    all_incidents = db.query(Incident.ppe_violation_types).all()
    for row in all_incidents:
        if row[0]:
            items = row[0].split(",")
            for item in items:
                gear_counts[item] = gear_counts.get(item, 0) + 1
                
    return {
        "total_cameras": total_cameras,
        "active_cameras": active_cameras,
        "total_incidents": total_incidents,
        "pending_incidents": pending_incidents,
        "resolved_incidents": resolved_incidents,
        "compliance_rate": compliance_rate,
        "weekly_trend": trend,
        "severity_distribution": {
            "High": severity_dist.get("High", 0),
            "Medium": severity_dist.get("Medium", 0),
            "Low": severity_dist.get("Low", 0),
        },
        "gear_distribution": gear_counts
    }

@router.get("/snapshots/{filename}")
def get_snapshot_image(filename: str):
    """
    Returns the target incident image snapshot, falling back to a custom solid color canvas
    if the physical file was deleted or is not found.
    """
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
        
    # Return a fallback image (solid dark grey canvas with a red border indicating missing snapshot)
    import cv2
    import numpy as np
    
    fallback_img = np.zeros((480, 640, 3), dtype=np.uint8)
    fallback_img[:] = (35, 30, 28)
    cv2.rectangle(fallback_img, (0, 0), (640, 480), (0, 0, 180), 10)
    cv2.putText(fallback_img, "SNAPSHOT MISSING OR ARCHIVED", (100, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 200), 2)
    
    # Save the fallback image to temp and serve
    temp_fallback_path = os.path.join(settings.UPLOAD_DIR, "fallback_temp.jpg")
    cv2.imwrite(temp_fallback_path, fallback_img)
    return FileResponse(temp_fallback_path)
