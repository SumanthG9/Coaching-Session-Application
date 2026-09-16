from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_coach
from app.database.database import get_db
from app.models.coach_profile import CoachProfile
from app.models.user import User
from app.schemas.coach import (
    CoachProfileResponse,
    CoachProfileUpdate,
)

router = APIRouter(
    prefix="/coaches",
    tags=["Coaches"]
)

@router.get("/me", response_model=CoachProfileResponse)
def get_my_profile(
    current_user: User = Depends(require_coach),
    db : Session = Depends(get_db) 
):
    profile = (
        db.query(CoachProfile).filter(CoachProfile.user_id == current_user.id).first()
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach Profile not found",
        )
    return profile


@router.put("/me", response_model=CoachProfileResponse)
def update_my_profile(
    profile_data : CoachProfileUpdate,
    current_user : User = Depends(require_coach),
    db: Session = Depends(get_db)
):
    profile = (
        db.query(CoachProfile).filter(CoachProfile.user_id==current_user.id).first()
    )

    if profile is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Coach Profile Not Found"
        )

    profile.bio = profile_data.bio
    profile.years_experience=profile_data.years_experience
    profile.session_fee=profile_data.session_fee
    profile.availability=profile_data.availability

    db.commit()
    db.refresh(profile)

    return profile
