import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import RoleChecker
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraResponse, CameraUpdate
from app.services.stream_manager import stream_manager

router = APIRouter()

# Permissions
write_permission = Depends(RoleChecker(["Admin", "Supervisor"]))

@router.get("/", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()

@router.post("/", response_model=CameraResponse, dependencies=[write_permission])
def create_camera(camera_in: CameraCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if a policy exists for the location. If not, create a default policy.
    from app.models.policy import Policy
    policy = db.query(Policy).filter(Policy.worksite_name == camera_in.location).first()
    if not policy:
        default_policy = Policy(
            worksite_name=camera_in.location,
            require_helmet=True,
            require_vest=True,
            require_gloves=False,
            require_boots=False,
            require_goggles=False,
            require_respirator=False
        )
        db.add(default_policy)
        db.commit()

    camera = Camera(
        name=camera_in.name,
        rtsp_url=camera_in.rtsp_url,
        location=camera_in.location,
        is_active=True,
        status="Online"
    )
    db.add(camera)
    db.commit()
    db.refresh(camera)
    
    # Start background detection loop
    background_tasks.add_task(stream_manager.start_camera_monitoring, camera.id)
    return camera

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@router.put("/{camera_id}", response_model=CameraResponse, dependencies=[write_permission])
def update_camera(camera_id: int, camera_in: CameraUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    update_data = camera_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(camera, key, value)
        
    db.commit()
    db.refresh(camera)
    
    if camera.is_active:
        background_tasks.add_task(stream_manager.start_camera_monitoring, camera.id)
    else:
        stream_manager.stop_camera_monitoring(camera.id)
        camera.status = "Offline"
        db.commit()
        
    return camera

@router.delete("/{camera_id}", response_model=dict, dependencies=[write_permission])
def delete_camera(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    # Stop background tasks
    stream_manager.stop_camera_monitoring(camera_id)
    
    db.delete(camera)
    db.commit()
    return {"message": "Camera deleted successfully"}

@router.get("/{camera_id}/stream")
async def get_camera_stream(camera_id: int, db: Session = Depends(get_db)):
    """
    Return a live MJPEG stream for the given camera.
    """
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    if not camera.is_active:
        raise HTTPException(status_code=400, detail="Camera is inactive")
        
    return StreamingResponse(
        stream_manager.get_live_stream_generator(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
