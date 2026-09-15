from fastapi import FastAPI

app = FastAPI( title="Coaching Management System API",
              version="1.0.0" 
)

@app.get("/")
def root():
    return { "message" : "Coaching Management System API is running"}

@app.get("/health") 
def check_health():
    return {"status" : "Ok"}
    

