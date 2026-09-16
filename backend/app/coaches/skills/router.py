from app.models.coach_profile import CoachProfile
from app.models import UserRole
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.coach_skill import CoachSkill
from app.models.user import User
from app.schemas.coach_skill import CoachSkillCreate, CoachSkillResponse

router = APIRouter(
    prefix="/coaches/me/skills",
    tags=["Coach Skills"],
)

@router.post(
    "",
    response_model=CoachSkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_skill(
    skill_data: CoachSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.COACH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )

    coach_profile = (
        db.query(CoachProfile)
        .filter(CoachProfile.user_id == current_user.id)
        .first()
    )

    if coach_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach profile not found",
        )

    skill = CoachSkill(
        coach_id=coach_profile.id,
        skill=skill_data.skill_name,
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill


@router.get(
    "",
    response_model=list[CoachSkillResponse],
)
def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.COACH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )

    coach_profile = (
        db.query(CoachProfile)
        .filter(CoachProfile.user_id == current_user.id)
        .first()
    )

    if coach_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach profile not found",
        )

    skills = (
        db.query(CoachSkill)
        .filter(CoachSkill.coach_id == coach_profile.id)
        .all()
    )

    return skills

@router.delete(
    "/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.COACH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )

    coach_profile = (
        db.query(CoachProfile)
        .filter(CoachProfile.user_id == current_user.id)
        .first()
    )

    if coach_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach profile not found",
        )

    skill = (
        db.query(CoachSkill)
        .filter(
            CoachSkill.id == skill_id,
            CoachSkill.coach_id == coach_profile.id,
        )
        .first()
    )

    if skill is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    db.delete(skill)
    db.commit()

    return None
