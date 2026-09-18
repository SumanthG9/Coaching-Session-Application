from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user, require_coach, require_student
from app.database.database import get_db
from app.models.coach_profile import CoachProfile
from app.models.coaching_session import CoachingSession, SessionStatus
from app.models.student_profile import StudentProfile
from app.models.user import User, UserRole
from app.schemas.session import (
    SessionCreate,
    SessionComplete,
    SessionResponse,
)
from app.sessions.availability import is_time_within_availability


router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"],
)


def _get_student_profile(db: Session, user_id: int) -> StudentProfile:
    student_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user_id)
        .first()
    )
    if student_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )
    return student_profile


def _get_coach_profile(db: Session, user_id: int, lock: bool = False) -> CoachProfile:
    query = db.query(CoachProfile).filter(CoachProfile.user_id == user_id)
    if lock:
        query = query.with_for_update()
    coach_profile = query.first()
    if coach_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach profile not found",
        )
    return coach_profile


def _get_owned_session(
    db: Session,
    session_id: int,
    coach_id: int | None = None,
    student_id: int | None = None,
) -> CoachingSession:
    query = db.query(CoachingSession).filter(CoachingSession.id == session_id)
    if coach_id is not None:
        query = query.filter(CoachingSession.coach_id == coach_id)
    if student_id is not None:
        query = query.filter(CoachingSession.student_id == student_id)
    session = query.first()
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return session


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
    student_profile = _get_student_profile(db, current_user.id)

    # Pessimistic row-level lock on CoachProfile for race-safe booking
    coach_profile = (
        db.query(CoachProfile)
        .filter(CoachProfile.id == session_data.coach_id)
        .with_for_update()
        .first()
    )

    if coach_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach not found",
        )

    # Check coach availability schedule
    is_avail, avail_error = is_time_within_availability(
        coach_profile.availability,
        session_data.session_date,
        session_data.start_time,
        session_data.duration_minutes,
    )
    if not is_avail:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=avail_error,
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
    student_profile = _get_student_profile(db, current_user.id)
    return (
        db.query(CoachingSession)
        .filter(CoachingSession.student_id == student_profile.id)
        .order_by(CoachingSession.session_date, CoachingSession.start_time)
        .all()
    )


@router.get(
    "/requests",
    response_model=list[SessionResponse],
)
def get_coach_requests(
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    coach_profile = _get_coach_profile(db, current_user.id)
    return (
        db.query(CoachingSession)
        .filter(CoachingSession.coach_id == coach_profile.id)
        .order_by(CoachingSession.session_date, CoachingSession.start_time)
        .all()
    )


@router.put(
    "/{session_id}/accept",
    response_model=SessionResponse,
)
def accept_session(
    session_id: int,
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    coach_profile = _get_coach_profile(db, current_user.id, lock=True)
    session = _get_owned_session(db, session_id, coach_id=coach_profile.id)

    if session.status != SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending sessions can be accepted",
        )

    session_start = datetime.combine(session.session_date, session.start_time)
    session_end = session_start + timedelta(minutes=session.duration_minutes)

    accepted_sessions = (
        db.query(CoachingSession)
        .filter(
            CoachingSession.coach_id == coach_profile.id,
            CoachingSession.session_date == session.session_date,
            CoachingSession.status == SessionStatus.ACCEPTED,
            CoachingSession.id != session.id,
        )
        .all()
    )

    for accepted in accepted_sessions:
        acc_start = datetime.combine(accepted.session_date, accepted.start_time)
        acc_end = acc_start + timedelta(minutes=accepted.duration_minutes)
        if session_start < acc_end and session_end > acc_start:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot accept session: conflicts with another already accepted session",
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
    coach_profile = _get_coach_profile(db, current_user.id)
    session = _get_owned_session(db, session_id, coach_id=coach_profile.id)

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
    student_profile = _get_student_profile(db, current_user.id)
    session = _get_owned_session(db, session_id, student_id=student_profile.id)

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
    coach_profile = _get_coach_profile(db, current_user.id)
    session = _get_owned_session(db, session_id, coach_id=coach_profile.id)

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


@router.get(
    "/{session_id}",
    response_model=SessionResponse,
)
def get_session_details(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(CoachingSession)
        .filter(CoachingSession.id == session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    is_authorized = False
    if current_user.role == UserRole.STUDENT:
        student_profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == current_user.id)
            .first()
        )
        if student_profile and session.student_id == student_profile.id:
            is_authorized = True
    elif current_user.role == UserRole.COACH:
        coach_profile = (
            db.query(CoachProfile)
            .filter(CoachProfile.user_id == current_user.id)
            .first()
        )
        if coach_profile and session.coach_id == coach_profile.id:
            is_authorized = True

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this session",
        )

    return session