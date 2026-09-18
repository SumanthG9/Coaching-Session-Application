from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.auth.router import router as auth_router
from app.students.router import router as student_router
from app.coaches.router import router as coach_router
from app.coaches.skills.router import router as coach_skills_router
from app.coaches.search_router import router as coach_search_router
from app.sessions.router import router as sessions_router
from app.database.database import engine     

app = FastAPI( title="Student-Coach Management API",
              version="1.0.0" 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(coach_router)
app.include_router(coach_skills_router)
app.include_router(coach_search_router)
app.include_router(sessions_router)

@app.get("/")
def root():
    return { "message" : "Student-Coach Management API is running"}

@app.get("/health") 
def check_health():
    return {"status" : "Ok"}
    
@app.get("/health/database")
def database_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return{
        "status" : "Ok",
        "database": "connected",
    }



