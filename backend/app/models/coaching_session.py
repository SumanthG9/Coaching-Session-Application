
from datetime import date, datetime, time, timezone
from enum import Enum

from sqlalchemy import CheckConstraint, Date, DateTime, Enum as SQLEnum, ForeignKey, Integer
from sqlalchemy import String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

class SessionStatus(str,Enum):
    PENDING= "pending"
    ACCEPTED= "accepted"
    REJECTED= "rejected"
    CANCELLED="cancelled"
    COMPLETED="completed"

class CoachingSession(Base):
    __tablename__ = "coaching_sessions"
    __table_args__ = (
        CheckConstraint(
            "duration_minutes > 0",
            name="check_duration_positive"
        ),
    )


    id: Mapped[int] = mapped_column(
        primary_key=True, index=True
    )
    student_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id"),
        nullable=False,
        index=True,
    )
    coach_id: Mapped[int] = mapped_column(
        ForeignKey("coach_profiles.id"),
        nullable=False,
        index=True,
    )
    session_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    topic: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )
    student_message: Mapped[str|None] = mapped_column(
        Text,
        nullable=True,
    )
    coach_remarks: Mapped[str|None] = mapped_column(
        Text,
        nullable=True,
    )
    meeting_link: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    status: Mapped[SessionStatus] = mapped_column(
        SQLEnum(SessionStatus),
        nullable=False,
        default=SessionStatus.PENDING,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    student = relationship(
        "StudentProfile",
        back_populates="sessions",
        foreign_keys=[student_id],
    )
    coach = relationship(
        "CoachProfile",
        back_populates="sessions",
        foreign_keys=[coach_id] 
    )

    @property
    def student_name(self) -> str | None:
        if self.student and self.student.user:
            return self.student.user.name
        return None

    @property
    def coach_name(self) -> str | None:
        if self.coach and self.coach.user:
            return self.coach.user.name
        return None

