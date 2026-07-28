from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import RoleChecker
from app.models.policy import Policy
from app.schemas.policy import PolicyCreate, PolicyResponse, PolicyUpdate

router = APIRouter()
write_permission = Depends(RoleChecker(["Admin", "Supervisor"]))

@router.get("/", response_model=List[PolicyResponse])
def get_policies(db: Session = Depends(get_db)):
    return db.query(Policy).all()

@router.post("/", response_model=PolicyResponse, dependencies=[write_permission])
def create_policy(policy_in: PolicyCreate, db: Session = Depends(get_db)):
    existing = db.query(Policy).filter(Policy.worksite_name == policy_in.worksite_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A policy for this worksite already exists.")
        
    policy = Policy(**policy_in.dict())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/{worksite_name}", response_model=PolicyResponse)
def get_policy(worksite_name: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.worksite_name == worksite_name).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found for this worksite")
    return policy

@router.put("/{policy_id}", response_model=PolicyResponse, dependencies=[write_permission])
def update_policy(policy_id: int, policy_in: PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    update_data = policy_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)
        
    db.commit()
    db.refresh(policy)
    return policy

@router.delete("/{policy_id}", response_model=dict, dependencies=[write_permission])
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted successfully"}
