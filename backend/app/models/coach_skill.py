from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

class CoachSkill(Base):
    __tablename__ = "coach_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    coach_id: Mapped[int] = mapped_column(
        ForeignKey("coach_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    skill: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )
    coach = relationship(
        "CoachProfile",
        back_populates="skills"
    )