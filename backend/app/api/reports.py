from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.core.database import get_db
from app.models.incident import Incident
from app.models.camera import Camera
from app.services.report_generator import ReportGenerator

router = APIRouter()

def get_report_data(db: Session):
    """
    Helper to fetch and format incidents and stats for reporting.
    """
    incidents = db.query(Incident).options(joinedload(Incident.camera)).order_by(Incident.timestamp.desc()).all()
    total_cameras = db.query(Camera).count()
    active_cameras = db.query(Camera).filter(Camera.is_active == True).count()
    total_incidents = len(incidents)
    pending_incidents = db.query(Incident).filter(Incident.status == "Pending").count()
    
    # Calculate safety compliance rate:
    if active_cameras > 0:
        deduction = (pending_incidents / active_cameras) * 12
        compliance_rate = max(0, min(100, int(100 - deduction)))
    else:
        compliance_rate = 100
        
    stats = {
        "total_cameras": total_cameras,
        "total_incidents": total_incidents,
        "compliance_rate": compliance_rate,
        "pending_incidents": pending_incidents
    }
    
    formatted_incidents = []
    for inc in incidents:
        formatted_incidents.append({
            "id": inc.id,
            "timestamp": inc.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "location": inc.camera.location if inc.camera else "Unknown",
            "camera_name": inc.camera.name if inc.camera else "Unknown",
            "ppe_violation_types": inc.ppe_violation_types.split(",") if inc.ppe_violation_types else [],
            "severity": inc.severity,
            "status": inc.status
        })
        
    return formatted_incidents, stats

@router.get("/pdf")
def get_pdf_report(db: Session = Depends(get_db)):
    incidents, stats = get_report_data(db)
    
    try:
        pdf_buffer = ReportGenerator.generate_incidents_pdf(incidents, stats)
        filename = f"safety_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {e}")

@router.get("/csv")
def get_csv_report(db: Session = Depends(get_db)):
    incidents, _ = get_report_data(db)
    
    try:
        csv_buffer = ReportGenerator.generate_incidents_csv(incidents)
        filename = f"safety_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV report: {e}")
