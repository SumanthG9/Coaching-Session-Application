from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_student
from app.database.database import get_db
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.schemas.student import (
    StudentProfileResponse,
    StudentProfileUpdate,
)

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)

@router.get("/me", response_model=StudentProfileResponse)
def get_my_profile(
    current_user : User = Depends(require_student),
    db: Session = Depends(get_db),
): 
    profile = (
        db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    )

    if profile is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Student Profile not found"
        )
    
    return profile

@router.put("/me", response_model=StudentProfileResponse)
def update_my_profile(
    profile_data: StudentProfileUpdate,
    current_user: User = Depends(require_student),
    db : Session = Depends(get_db)
):
    profile = (db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first())

    if profile is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Student Profile not found"
        )
    
    profile.phone = profile_data.phone
    profile.education = profile_data.education
    profile.bio = profile_data.bio

    db.commit()
    db.refresh(profile)

    return profile