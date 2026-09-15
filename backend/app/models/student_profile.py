from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    phone: Mapped[str | None] = mapped_column( String(30), nullable=True)
    education : Mapped[str | None] = mapped_column( String(255), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    user = relationship("User", back_populates="student_profile")
    sessions = relationship(
        "CoachingSession",
        back_populates="student",
        foreign_keys="CoachingSession.student_id",
    )
