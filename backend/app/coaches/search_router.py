from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import require_student
from app.database.database import get_db
from app.models.coach_profile import CoachProfile
from app.models.coach_skill import CoachSkill
from app.models.user import User
from app.schemas.coach_search import CoachSearchResponse


router = APIRouter(
    prefix="/coaches",
    tags=["Coach Search"],
)


def _format_coach(coach_profile: CoachProfile, user: User, skills: list[str]) -> dict:
    return {
        "id": coach_profile.id,
        "name": user.name,
        "bio": coach_profile.bio,
        "years_experience": coach_profile.years_experience,
        "session_fee": coach_profile.session_fee,
        "availability": coach_profile.availability,
        "skills": skills,
    }


@router.get(
    "",
    response_model=list[CoachSearchResponse],
)
def search_coaches(
    skill: str | None = None,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            CoachProfile,
            User,
            CoachSkill,
        )
        .join(
            User,
            CoachProfile.user_id == User.id,
        )
        .outerjoin(
            CoachSkill,
            CoachSkill.coach_id == CoachProfile.id,
        )
    )

    if skill:
        query = query.filter(
            CoachSkill.skill.ilike(f"%{skill}%")
        )

    rows = query.all()
    coaches: dict[int, dict] = {}

    for coach_profile, user, coach_skill in rows:
        if coach_profile.id not in coaches:
            coaches[coach_profile.id] = _format_coach(coach_profile, user, [])

        if coach_skill is not None:
            coaches[coach_profile.id]["skills"].append(coach_skill.skill)

    return list(coaches.values())


@router.get(
    "/{coach_id}",
    response_model=CoachSearchResponse,
)
def get_coach_details(
    coach_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            CoachProfile,
            User,
            CoachSkill,
        )
        .join(
            User,
            CoachProfile.user_id == User.id,
        )
        .outerjoin(
            CoachSkill,
            CoachSkill.coach_id == CoachProfile.id,
        )
        .filter(
            CoachProfile.id == coach_id
        )
        .all()
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Coach not found",
        )

    coach_profile, user, _ = rows[0]
    skills = [cs.skill for _, _, cs in rows if cs is not None]
    return _format_coach(coach_profile, user, skills)