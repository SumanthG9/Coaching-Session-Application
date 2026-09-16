from datetime import date, time, datetime

from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    coach_id: int
    session_date: date
    start_time: time
    duration_minutes: int = Field(gt=0)
    topic: str = Field(min_length=2, max_length=255)
    student_message: str | None = None


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