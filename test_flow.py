import urllib.request
import urllib.error
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

print("=" * 60)
print("RUNNING COMPREHENSIVE INTEGRATION AUDIT TEST FLOW")
print("=" * 60)

# 1. Register and login coach
print(f"1. Registering coach: {coach_email}")
post("/auth/register/coach", {"name": "Dr. Marcus Vance", "email": coach_email, "password": password, "role": "coach"})
coach_login = post("/auth/login", {"email": coach_email, "password": password})
coach_token = coach_login["access_token"]
print("   Coach registered and logged in successfully.")

# 2. Update coach profile
print("2. Updating coach profile & availability schedule...")
profile = post("/coaches/me", {
    "bio": "Senior Architect & Mentor. Specializing in Python, FastAPI, React, and distributed systems.",
    "years_experience": 7,
    "session_fee": 85.0,
    "availability": "Mon-Sun 10:00 AM - 10:00 PM EST"
}, token=coach_token, method="PUT")
print(f"   Coach Profile updated: ID={profile['id']}, exp={profile['years_experience']}, fee={profile['session_fee']}")

# 2b. Test dedicated availability endpoint
avail_update = post("/coaches/me/availability", {
    "availability": "Mon-Sun 10:00 - 22:00"
}, token=coach_token, method="PUT")
print(f"   Dedicated PUT /coaches/me/availability verified: {avail_update['availability']}")

# 3. Add skills
print("3. Adding coach skills...")
s1 = post("/coaches/me/skills", {"skill_name": "Python"}, token=coach_token)
s2 = post("/coaches/me/skills", {"skill_name": "FastAPI"}, token=coach_token)
s3 = post("/coaches/me/skills", {"skill_name": "React"}, token=coach_token)
print(f"   Skills added: {s1['skill']}, {s2['skill']}, {s3['skill']}")

# 4. Register and login student
print(f"4. Registering student: {student_email}")
post("/auth/register/student", {"name": "Elena Rostova", "email": student_email, "password": password, "role": "student"})
student_login = post("/auth/login", {"email": student_email, "password": password})
student_token = student_login["access_token"]
print("   Student registered and logged in successfully.")

# 5. Search coaches as student
print("5. Student searches coaches...")
coaches = get("/coaches", token=student_token)
print(f"   Student searched coaches: found {len(coaches)} coaches.")
coach_marcus = next(c for c in coaches if c["id"] == profile["id"])
print(f"   Found Marcus: {coach_marcus['name']}, skills: {coach_marcus['skills']}")

# 6. Test availability enforcement: attempt booking outside coach availability window
print("6. Verifying availability enforcement (attempting out-of-schedule booking at 08:00 AM)...")
future_date = (date.today() + timedelta(days=2)).isoformat()
try:
    post("/sessions", {
        "coach_id": profile["id"],
        "session_date": future_date,
        "start_time": "08:00:00",
        "duration_minutes": 60,
        "topic": "Early Morning Request",
    }, token=student_token)
    raise AssertionError("Expected 400 Bad Request for booking outside availability window!")
except urllib.error.HTTPError as e:
    assert e.code == 400
    print("   Availability enforcement verified: out-of-window request correctly rejected with 400 Bad Request.")

# 7. Book valid session within coach availability
print("7. Booking valid session within coach availability schedule (15:00)...")
session = post("/sessions", {
    "coach_id": profile["id"],
    "session_date": future_date,
    "start_time": "15:00:00",
    "duration_minutes": 60,
    "topic": "FastAPI Architecture Deep Dive",
    "student_message": "Excited to discuss background workers and database optimizations."
}, token=student_token)
print(f"   Session booked: ID={session['id']}, Status={session['status']}, CoachName={session.get('coach_name')}, StudentName={session.get('student_name')}")

# 8. Test dedicated session details endpoint: GET /sessions/{id}
print(f"8. Testing dedicated session details endpoint: GET /sessions/{session['id']}...")
student_view = get(f"/sessions/{session['id']}", token=student_token)
assert student_view["id"] == session["id"]
assert student_view["topic"] == "FastAPI Architecture Deep Dive"
assert student_view["student_name"] == "Elena Rostova"
assert student_view["coach_name"] == "Dr. Marcus Vance"
coach_view = get(f"/sessions/{session['id']}", token=coach_token)
assert coach_view["id"] == session["id"]
print("   Dedicated session details endpoint successfully verified by both student and coach.")

# 9. Coach views incoming requests
print("9. Coach views incoming requests...")
requests = get("/sessions/requests", token=coach_token)
req = next(r for r in requests if r["id"] == session["id"])
print(f"   Coach sees request from student: {req.get('student_name')}, status={req['status']}")

# 10. Coach accepts session
print(f"10. Coach accepts session #{session['id']}...")
accepted = post(f"/sessions/{session['id']}/accept", token=coach_token, method="PUT")
print(f"    Session accepted: status={accepted['status']}")

# 11. Coach completes session with remarks
print(f"11. Coach completes session #{session['id']} with remarks...")
completed = post(f"/sessions/{session['id']}/complete", {
    "coach_remarks": "Outstanding session! Elena demonstrated great grasp of asynchronous I/O and SQLAlchemy connection pooling."
}, token=coach_token, method="PUT")
print(f"    Session completed: status={completed['status']}, remarks={completed['coach_remarks']}")

# 12. Student verifies completed session details
print("12. Student verifies updated session in details endpoint & history...")
updated_details = get(f"/sessions/{session['id']}", token=student_token)
assert updated_details["status"] == "completed"
assert updated_details["coach_remarks"] == "Outstanding session! Elena demonstrated great grasp of asynchronous I/O and SQLAlchemy connection pooling."

student_sessions = get("/sessions/my", token=student_token)
my_sess = next(s for s in student_sessions if s["id"] == session["id"])
print(f"    Student verifies completed session: status={my_sess['status']}, remarks={my_sess['coach_remarks']}")

print("\n" + "=" * 60)
print(">>> ALL 12 INTEGRATION STEPS PASSED PERFECTLY! <<<")
print("=" * 60)
