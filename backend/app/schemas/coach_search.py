from decimal import Decimal

from pydantic import BaseModel


class CoachSearchResponse(BaseModel):
    id: int
    name: str
    bio: str | None
    years_experience: int
    session_fee: Decimal
    availability: str | None
    skills: list[str]