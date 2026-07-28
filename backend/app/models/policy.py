from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    worksite_name = Column(String, unique=True, index=True, nullable=False)
    require_helmet = Column(Boolean, default=True)
    require_vest = Column(Boolean, default=True)
    require_gloves = Column(Boolean, default=False)
    require_boots = Column(Boolean, default=False)
    require_goggles = Column(Boolean, default=False)
    require_respirator = Column(Boolean, default=False)
