from email.policy import default
from decimal import Decimal
from pydantic import BaseModel, Field

class CoachProfileUpdate(BaseModel):
    bio: str | None = None
    years_experience : int = Field(default=0,ge=0)
    session_fee: Decimal = Field(default=0,ge=0)
    availability : str | None = None

class CoachAvailabilityUpdate(BaseModel):
    availability: str | None = None


class CoachProfileResponse(BaseModel):
    id: int
    user_id : int
    bio : str | None
    years_experience : int
    session_fee : Decimal
    availability :  str | None

    model_config ={
        "from_attributes" : True
    }