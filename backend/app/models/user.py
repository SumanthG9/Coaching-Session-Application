from datetime import datetime
from enum import Enum
from sqlalchemy import DateTime, Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

class UserRole(str, Enum):
    STUDENT = "student"
    COACH = "coach"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    student_profile = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
    )
    coach_profile = relationship(
        "CoachProfile",
        back_populates="user",
        uselist=False,
    )