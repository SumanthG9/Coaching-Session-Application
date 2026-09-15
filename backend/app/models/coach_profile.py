from enum import unique
from decimal import Decimal
from sqlalchemy import CheckConstraint,ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

class CoachProfile(Base):
    __tablename__ = "coach_profiles"
    __table_args__ = (
        CheckConstraint(
            "years_experience >= 0",
            name="check_years_experience_nonnegative",
        ),
        CheckConstraint(
            "session_fee >= 0",
            name="check_session_fee_nonnegative",
            )
        )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=True,
    )
    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    years_experience: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )
    session_fee: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        nullable=False,
        default=0,
    )
    availability: Mapped[str|None] = mapped_column(
        Text, nullable=True
    )
    user = relationship(
        "User",
        back_populates="coach_profile"
    )


    skills = relationship(
        "CoachSkill",
        back_populates="coach",
        cascade="all , delete-orphan"
    )

    sessions = relationship(
        "CoachingSession",
        back_populates="coach",
        foreign_keys="CoachingSession.coach_id",
    )
