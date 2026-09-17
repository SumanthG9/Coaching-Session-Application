import urllib.request
import json
import time
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def post(endpoint, data=None, token=None, method="POST"):
    url = f"{BASE_URL}{endpoint}"
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status == 204:
                return None
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"Error {e.code} on {endpoint}: {body}")
        raise e

def get(endpoint, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

ts = int(time.time())
coach_email = f"coach_{ts}@example.com"
student_email = f"student_{ts}@example.com"
password = "Password123!"

# 1. Register and login coach
print(f"Registering coach: {coach_email}")
post("/auth/register/coach", {"name": "Dr. Marcus Vance", "email": coach_email, "password": password, "role": "coach"})
coach_login = post("/auth/login", {"email": coach_email, "password": password})
coach_token = coach_login["access_token"]
print("Coach logged in successfully.")

# 2. Update coach profile
profile = post("/coaches/me", {
    "bio": "Senior Architect & Mentor. Specializing in Python, FastAPI, React, and distributed systems.",
    "years_experience": 7,
    "session_fee": 85.0,
    "availability": "Mon-Fri 4:00 PM - 8:00 PM EST"
}, token=coach_token, method="PUT")
print(f"Coach Profile updated: ID={profile['id']}, exp={profile['years_experience']}, fee={profile['session_fee']}")

# 3. Add skills
s1 = post("/coaches/me/skills", {"skill_name": "Python"}, token=coach_token)
s2 = post("/coaches/me/skills", {"skill_name": "FastAPI"}, token=coach_token)
s3 = post("/coaches/me/skills", {"skill_name": "React"}, token=coach_token)
print(f"Skills added: {s1['skill']}, {s2['skill']}, {s3['skill']}")

# 4. Register and login student
print(f"Registering student: {student_email}")
post("/auth/register/student", {"name": "Elena Rostova", "email": student_email, "password": password, "role": "student"})
student_login = post("/auth/login", {"email": student_email, "password": password})
student_token = student_login["access_token"]
print("Student logged in successfully.")

# 5. Search coaches as student
coaches = get("/coaches", token=student_token)
print(f"Student searched coaches: found {len(coaches)} coaches.")
coach_marcus = next(c for c in coaches if c["id"] == profile["id"])
print(f"Found Marcus: {coach_marcus['name']}, skills: {coach_marcus['skills']}")

# 6. Book session
tomorrow = (date.today() + timedelta(days=2)).isoformat()
session = post("/sessions", {
    "coach_id": profile["id"],
    "session_date": tomorrow,
    "start_time": "15:00:00",
    "duration_minutes": 60,
    "topic": "FastAPI Architecture Deep Dive",
    "student_message": "Excited to discuss background workers and database optimizations."
}, token=student_token)
print(f"Session booked: ID={session['id']}, Status={session['status']}, CoachName={session.get('coach_name')}, StudentName={session.get('student_name')}")

# 7. Coach views requests
requests = get("/sessions/requests", token=coach_token)
req = next(r for r in requests if r["id"] == session["id"])
print(f"Coach sees request from student: {req.get('student_name')}, status={req['status']}")

# 8. Coach accepts session
accepted = post(f"/sessions/{session['id']}/accept", token=coach_token, method="PUT")
print(f"Session accepted: status={accepted['status']}")

# 9. Coach completes session with remarks
completed = post(f"/sessions/{session['id']}/complete", {
    "coach_remarks": "Outstanding session! Elena demonstrated great grasp of asynchronous I/O and SQLAlchemy connection pooling."
}, token=coach_token, method="PUT")
print(f"Session completed: status={completed['status']}, remarks={completed['coach_remarks']}")

# 10. Student checks sessions history
student_sessions = get("/sessions/my", token=student_token)
my_sess = next(s for s in student_sessions if s["id"] == session["id"])
print(f"Student verifies completed session with remarks: status={my_sess['status']}, coach_remarks={my_sess['coach_remarks']}")
print("\n>>> ALL 10 STEPS PASSED PERFECTLY! <<<")
