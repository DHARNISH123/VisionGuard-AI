import os
import cv2
import time
import asyncio
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.camera import Camera
from app.models.policy import Policy
from app.models.incident import Incident
from app.services.detector import detector
from app.services.websocket_manager import manager

class StreamManager:
    def __init__(self):
        self.active_streams = {}
        # Keep track of last incident time per camera to avoid spamming the db
        self.last_incident_time = {}

    def generate_mock_factory_frame(self, camera_name: str, location: str) -> np.ndarray:
        """
        Creates a high-fidelity mock video frame representing a factory environment.
        """
        # Create a dark slate background (SaaS premium aesthetic)
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame[:] = (30, 27, 24)  # Hex #181B1E approx in BGR
        
        # Draw a grid pattern for factory floor
        for x in range(0, 640, 80):
            cv2.line(frame, (x, 0), (x, 480), (45, 40, 38), 1)
        for y in range(0, 480, 60):
            cv2.line(frame, (0, y), (640, y), (45, 40, 38), 1)
            
        # Draw safety zone line (yellow dashed)
        cv2.line(frame, (100, 350), (540, 350), (0, 200, 220), 3) # Yellow-orange
        cv2.putText(frame, "SAFETY ZONE LIMIT", (120, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 220), 1)

        # Draw a mock equipment or machine box
        cv2.rectangle(frame, (50, 100), (200, 250), (80, 70, 65), -1)
        cv2.rectangle(frame, (50, 100), (200, 250), (120, 110, 100), 2)
        cv2.putText(frame, "EQUIPMENT A-1", (60, 125), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Add dynamic digital scanlines or time overlay
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"CAM: {camera_name.upper()} | {location.upper()}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, now, (440, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Watermark/Status
        cv2.putText(frame, "LIVE FEED (SIMULATED)", (20, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        return frame

    async def start_camera_monitoring(self, camera_id: int):
        """
        Periodically checks the camera, runs detection, and records incidents
        if violations persist.
        """
        if camera_id in self.active_streams:
            return
        
        self.active_streams[camera_id] = True
        print(f"Started monitoring camera {camera_id}")
        
        db = SessionLocal()
        try:
            while self.active_streams.get(camera_id):
                camera = db.query(Camera).filter(Camera.id == camera_id).first()
                if not camera or not camera.is_active:
                    break
                
                # Fetch policy for the site
                policy = db.query(Policy).filter(Policy.worksite_name == camera.location).first()
                policy_dict = {
                    "require_helmet": policy.require_helmet if policy else True,
                    "require_vest": policy.require_vest if policy else True,
                    "require_gloves": policy.require_gloves if policy else False,
                    "require_boots": policy.require_boots if policy else False,
                    "require_goggles": policy.require_goggles if policy else False,
                    "require_respirator": policy.require_respirator if policy else False
                }
                
                # Retrieve frame
                frame = self.generate_mock_factory_frame(camera.name, camera.location)
                
                # Detect
                processed, missing, detections = detector.detect_and_draw(frame, policy_dict)
                
                # Handle incidents - Smart Incident Detection (Version 2.0 Feature)
                if missing:
                    camera.status = "Alerting"
                    db.commit()
                    
                    # Look up active pending incident on this camera
                    active_incident = db.query(Incident).filter(
                        Incident.camera_id == camera_id,
                        Incident.status == "Pending"
                    ).order_by(Incident.timestamp.desc()).first()
                    
                    current_time = time.time()
                    snapshot_filename = f"cam_{camera_id}_{int(current_time)}.jpg"
                    snapshot_path = os.path.join(settings.UPLOAD_DIR, snapshot_filename)
                    cv2.imwrite(snapshot_path, processed)
                    relative_url = f"/api/v1/incidents/snapshots/{snapshot_filename}"
                    
                    severity = "Low"
                    if len(missing) >= 3:
                        severity = "High"
                    elif len(missing) >= 2:
                        severity = "Medium"
                        
                    if active_incident:
                        # Hysteresis update: update existing pending alert in place
                        active_incident.timestamp = datetime.utcnow()
                        active_incident.ppe_violation_types = ",".join(missing)
                        active_incident.snapshot_url = relative_url
                        active_incident.severity = severity
                        db.commit()
                        
                        alert_payload = {
                            "type": "UPDATE_ALERT",
                            "data": {
                                "id": active_incident.id,
                                "camera_id": camera_id,
                                "camera_name": camera.name,
                                "location": camera.location,
                                "timestamp": active_incident.timestamp.isoformat(),
                                "ppe_violation_types": missing,
                                "snapshot_url": relative_url,
                                "severity": severity,
                                "status": "Pending"
                            }
                        }
                        await manager.broadcast(alert_payload)
                    else:
                        # Create a new alert
                        incident = Incident(
                            camera_id=camera_id,
                            timestamp=datetime.utcnow(),
                            ppe_violation_types=",".join(missing),
                            snapshot_url=relative_url,
                            severity=severity,
                            status="Pending"
                        )
                        db.add(incident)
                        db.commit()
                        db.refresh(incident)
                        
                        alert_payload = {
                            "type": "NEW_ALERT",
                            "data": {
                                "id": incident.id,
                                "camera_id": camera_id,
                                "camera_name": camera.name,
                                "location": camera.location,
                                "timestamp": incident.timestamp.isoformat(),
                                "ppe_violation_types": missing,
                                "snapshot_url": relative_url,
                                "severity": severity,
                                "status": "Pending"
                            }
                        }
                        await manager.broadcast(alert_payload)
                else:
                    if camera.status != "Online":
                        camera.status = "Online"
                        db.commit()
                        
                    # Auto-resolve active pending violations if worker puts on PPE or leaves
                    active_incident = db.query(Incident).filter(
                        Incident.camera_id == camera_id,
                        Incident.status == "Pending"
                    ).order_by(Incident.timestamp.desc()).first()
                    
                    if active_incident:
                        active_incident.status = "Resolved"
                        db.commit()
                        
                        resolve_payload = {
                            "type": "ALERT_RESOLVED",
                            "data": {
                                "id": active_incident.id,
                                "camera_id": camera_id,
                                "status": "Resolved"
                            }
                        }
                        await manager.broadcast(resolve_payload)
                
                await asyncio.sleep(3.0)  # Check every 3 seconds
        except Exception as e:
            print(f"Error monitoring camera {camera_id}: {e}")
        finally:
            self.active_streams[camera_id] = False
            camera = db.query(Camera).filter(Camera.id == camera_id).first()
            if camera:
                camera.status = "Offline"
                db.commit()
            db.close()
            print(f"Stopped monitoring camera {camera_id}")

    def stop_camera_monitoring(self, camera_id: int):
        if camera_id in self.active_streams:
            self.active_streams[camera_id] = False

    async def get_live_stream_generator(self, camera_id: int):
        """
        Yields multipart frames for streaming MJPEG directly to an <img> tag.
        """
        db = SessionLocal()
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            db.close()
            return
            
        location = camera.location
        name = camera.name
        
        # Policy
        policy = db.query(Policy).filter(Policy.worksite_name == location).first()
        policy_dict = {
            "require_helmet": policy.require_helmet if policy else True,
            "require_vest": policy.require_vest if policy else True,
            "require_gloves": policy.require_gloves if policy else False,
            "require_boots": policy.require_boots if policy else False,
            "require_goggles": policy.require_goggles if policy else False,
            "require_respirator": policy.require_respirator if policy else False
        }
        db.close()
        
        try:
            while True:
                # Re-fetch frame
                frame = self.generate_mock_factory_frame(name, location)
                processed, _, _ = detector.detect_and_draw(frame, policy_dict)
                
                _, jpeg = cv2.imencode('.jpg', processed)
                frame_bytes = jpeg.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                await asyncio.sleep(0.1)  # 10 fps
        except asyncio.CancelledError:
            pass

stream_manager = StreamManager()
