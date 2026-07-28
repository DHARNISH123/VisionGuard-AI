import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.camera import Camera
from app.models.policy import Policy
from app.models.incident import Incident
from app.api import auth, users, cameras, incidents, policies, reports, ai
from app.services.websocket_manager import manager
from app.services.stream_manager import stream_manager

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
app.include_router(cameras.router, prefix=f"{settings.API_V1_STR}/cameras", tags=["Cameras"])
app.include_router(incidents.router, prefix=f"{settings.API_V1_STR}/incidents", tags=["Incidents"])
app.include_router(policies.router, prefix=f"{settings.API_V1_STR}/policies", tags=["Policies"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Safety Assistant"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We listen for messages from clients, though the client mostly listens for alerts
            data = await websocket.receive_text()
            # Respond to ping or diagnostic queries if any
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)

# Startup hook to initialize DB tables and seed data
@app.on_event("startup")
async def startup_event():
    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
    
    # 2. Seed initial data if DB is empty
    db = next(get_db())
    try:
        # Check if we have users, if not create default users
        if db.query(User).count() == 0:
            admin = User(
                email="admin@visionguard.com",
                hashed_password=get_password_hash("Admin@123"),
                full_name="Administrator",
                role="Admin",
                is_active=True
            )
            supervisor = User(
                email="supervisor@visionguard.com",
                hashed_password=get_password_hash("Supervisor@123"),
                full_name="Safety Supervisor",
                role="Supervisor",
                is_active=True
            )
            operator = User(
                email="operator@visionguard.com",
                hashed_password=get_password_hash("Operator@123"),
                full_name="Control Room Operator",
                role="Operator",
                is_active=True
            )
            db.add_all([admin, supervisor, operator])
            db.commit()
            print("Default authentication roles seeded.")
            
        # Seed Worksites Policies
        if db.query(Policy).count() == 0:
            site_a = Policy(
                worksite_name="Assembly Line A",
                require_helmet=True,
                require_vest=True,
                require_gloves=True,
                require_boots=False,
                require_goggles=False,
                require_respirator=False
            )
            site_b = Policy(
                worksite_name="Chemical Mixing B",
                require_helmet=True,
                require_vest=True,
                require_gloves=True,
                require_boots=True,
                require_goggles=True,
                require_respirator=True
            )
            site_c = Policy(
                worksite_name="Loading Dock C",
                require_helmet=True,
                require_vest=True,
                require_gloves=False,
                require_boots=True,
                require_goggles=False,
                require_respirator=False
            )
            db.add_all([site_a, site_b, site_c])
            db.commit()
            print("Default worksite policy restrictions seeded.")
            
        # Seed Cameras
        if db.query(Camera).count() == 0:
            cam1 = Camera(name="Main Entrance Cam", rtsp_url="mock_rtsp_1", location="Assembly Line A", is_active=True, status="Online")
            cam2 = Camera(name="Hazard Zone Area", rtsp_url="mock_rtsp_2", location="Chemical Mixing B", is_active=True, status="Online")
            cam3 = Camera(name="Logistics Gate", rtsp_url="mock_rtsp_3", location="Loading Dock C", is_active=True, status="Online")
            db.add_all([cam1, cam2, cam3])
            db.commit()
            print("Default worksite camera streams seeded.")
            
        # 3. Spin up background tasks for active cameras
        active_cams = db.query(Camera).filter(Camera.is_active == True).all()
        for cam in active_cams:
            # We schedule this task using asyncio so it runs concurrently with uvicorn
            asyncio.create_task(stream_manager.start_camera_monitoring(cam.id))
            
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
