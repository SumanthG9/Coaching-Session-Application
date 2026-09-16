from pydantic import BaseModel, Field

class StudentProfileUpdate(BaseModel):
    phone : str | None = Field(default=None, max_length=30)
    education : str | None = Field(default=None,max_length=255)
    bio: str | None = None

class StudentProfileResponse(BaseModel):
    id : int
    user_id : int
    phone : str | None
    education : str | None
    bio : str | None
    model_config = {
        "from_attributes" :  True
    }

