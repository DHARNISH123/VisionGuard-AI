from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import RoleChecker, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()
admin_dependency = Depends(RoleChecker(["Admin"]))

@router.get("/", response_model=List[UserResponse], dependencies=[admin_dependency])
def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.put("/{user_id}", response_model=UserResponse, dependencies=[admin_dependency])
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        from app.core.security import get_password_hash
        db_user.hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", response_model=dict, dependencies=[admin_dependency])
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Users cannot delete themselves.")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}
