from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import require_coach
from app.auth.dependencies import require_student
from app.database.database import get_db
from app.models.coach_profile import CoachProfile
from app.models.coaching_session import CoachingSession, SessionStatus
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.schemas.session import (
    SessionCreate,
    SessionComplete,
    SessionResponse,
)


router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"],
)


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    session_data: SessionCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )

    if student_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    coach_profile = (
        db.query(CoachProfile)
        .filter(CoachProfile.id == session_data.coach_id)
        .first()
    )

    if coach_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach not found",
        )

    session_end = (
        datetime.combine(
            session_data.session_date,
            session_data.start_time,
        )
        + timedelta(minutes=session_data.duration_minutes)
    )

    existing_sessions = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.coach_id == coach_profile.id,
            CoachingSession.session_date == session_data.session_date,
            CoachingSession.status.in_(
                [
                    SessionStatus.PENDING,
                    SessionStatus.ACCEPTED,
                ]
            ),
        )
        .all()
    )

    for existing in existing_sessions:
        existing_start = datetime.combine(
            existing.session_date,
            existing.start_time,
        )

        existing_end = existing_start + timedelta(
            minutes=existing.duration_minutes
        )

        requested_start = datetime.combine(
            session_data.session_date,
            session_data.start_time,
        )

        if requested_start < existing_end and session_end > existing_start:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Coach is not available during this time",
            )

    new_session = CoachingSession(
        student_id=student_profile.id,
        coach_id=coach_profile.id,
        session_date=session_data.session_date,
        start_time=session_data.start_time,
        duration_minutes=session_data.duration_minutes,
        topic=session_data.topic,
        student_message=session_data.student_message,
        status=SessionStatus.PENDING,
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session

@router.get(
    "/my",
    response_model=list[SessionResponse],
)
def get_my_sessions(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )

    if student_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    sessions = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.student_id == student_profile.id
        )
        .order_by(
            CoachingSession.session_date,
            CoachingSession.start_time,
        )
        .all()
    )

    return sessions

@router.get(
    "/requests",
    response_model=list[SessionResponse],
)
def get_coach_requests(
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
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

    sessions = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.coach_id == coach_profile.id
        )
        .order_by(
            CoachingSession.session_date,
            CoachingSession.start_time,
        )
        .all()
    )

    return sessions

@router.put(
    "/{session_id}/accept",
    response_model=SessionResponse,
)
def accept_session(
    session_id: int,
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
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

    session = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.id == session_id,
            CoachingSession.coach_id == coach_profile.id,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending sessions can be accepted",
        )

    session.status = SessionStatus.ACCEPTED

    db.commit()
    db.refresh(session)

    return session

@router.put(
    "/{session_id}/reject",
    response_model=SessionResponse,
)
def reject_session(
    session_id: int,
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
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

    session = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.id == session_id,
            CoachingSession.coach_id == coach_profile.id,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending sessions can be rejected",
        )

    session.status = SessionStatus.REJECTED

    db.commit()
    db.refresh(session)

    return session

@router.put(
    "/{session_id}/cancel",
    response_model=SessionResponse,
)
def cancel_session(
    session_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )

    if student_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    session = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.id == session_id,
            CoachingSession.student_id == student_profile.id,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending sessions can be cancelled",
        )

    session.status = SessionStatus.CANCELLED

    db.commit()
    db.refresh(session)

    return session

@router.put(
    "/{session_id}/complete",
    response_model=SessionResponse,
)
def complete_session(
    session_id: int,
    session_data: SessionComplete,
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
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

    session = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.id == session_id,
            CoachingSession.coach_id == coach_profile.id,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != SessionStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only accepted sessions can be completed",
        )

    session.coach_remarks = session_data.coach_remarks
    session.status = SessionStatus.COMPLETED

    db.commit()
    db.refresh(session)

    return session