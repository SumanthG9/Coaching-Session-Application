from pydantic import BaseModel, Field

class CoachSkillCreate(BaseModel):
    skill_name : str = Field(min_length=2, max_length=100)

class CoachSkillResponse(BaseModel):
    id : int
    coach_id : int
    skill : str

    model_config = {
        "from_attributes" : True
    }