import sys
import os

# Append project root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.camera import Camera
from app.models.policy import Policy
from app.core.database import SessionLocal

def init_db():
    print("Resetting database...")
    # Drop all and recreate
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
    
    db = SessionLocal()
    try:
        # Create Users
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
        print("Default users seeded: admin@visionguard.com (pwd: Admin@123), supervisor@visionguard.com (pwd: Supervisor@123), operator@visionguard.com (pwd: Operator@123)")
        
        # Create Policies
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
        db.add_all([site_a, site_b])
        db.commit()
        print("Default policies seeded.")
        
        # Create Cameras
        cam1 = Camera(
            name="Main Assembly Camera",
            rtsp_url="mock_rtsp_1",
            location="Assembly Line A",
            is_active=True,
            status="Online"
        )
        cam2 = Camera(
            name="Chemical Lab Camera",
            rtsp_url="mock_rtsp_2",
            location="Chemical Mixing B",
            is_active=True,
            status="Online"
        )
        db.add_all([cam1, cam2])
        db.commit()
        print("Default cameras seeded.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
