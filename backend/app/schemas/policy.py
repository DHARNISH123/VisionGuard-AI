from typing import Optional
from pydantic import BaseModel

class PolicyBase(BaseModel):
    worksite_name: str
    require_helmet: bool = True
    require_vest: bool = True
    require_gloves: bool = False
    require_boots: bool = False
    require_goggles: bool = False
    require_respirator: bool = False

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    require_helmet: Optional[bool] = None
    require_vest: Optional[bool] = None
    require_gloves: Optional[bool] = None
    require_boots: Optional[bool] = None
    require_goggles: Optional[bool] = None
    require_respirator: Optional[bool] = None

class PolicyResponse(PolicyBase):
    id: int

    class Config:
        from_attributes = True
