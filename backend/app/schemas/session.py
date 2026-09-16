from datetime import date, time, datetime

from pydantic import BaseModel, Field, field_validator


class SessionCreate(BaseModel):
    coach_id: int
    session_date: date
    start_time: time
    duration_minutes: int = Field(gt=0)
    topic: str = Field(min_length=2, max_length=255)
    student_message: str | None = None

    @field_validator("session_date")
    @classmethod
    def validate_session_date(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("Session date cannot be in the past")
        return value


class SessionResponse(BaseModel):
    id: int
    student_id: int
    coach_id: int
    session_date: date
    start_time: time
    duration_minutes: int
    topic: str
    student_message: str | None
    coach_remarks: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class SessionComplete(BaseModel):
    coach_remarks: str | None = None