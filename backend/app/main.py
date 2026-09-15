from fastapi import FastAPI
from sqlalchemy import text
from app.auth.router import router as auth_router
from app.database.database import engine     

app = FastAPI( title="Coaching Management System API",
              version="1.0.0" 
)

app.include_router(auth_router)

@app.get("/")
def root():
    return { "message" : "Coaching Management System API is running"}

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
