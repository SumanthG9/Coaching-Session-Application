import time
from datetime import date, timedelta
import pytest

def test_session_booking_and_availability(client, create_student, create_coach):
    student = create_student()
    coach = create_coach()

    # Set coach availability: Mon-Sun 10:00 - 18:00
    client.put("/coaches/me/availability", headers=coach["headers"], json={
        "availability": "Mon-Sun 10:00 - 18:00"
    })

    future_date = (date.today() + timedelta(days=5)).isoformat()

    # 1. Booking outside availability (too early, 08:00)
    bad_resp = client.post("/sessions", headers=student["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "08:00:00",
        "duration_minutes": 60,
        "topic": "Early Bird Session",
    })
    assert bad_resp.status_code == 400
    assert "outside the coach's availability window" in bad_resp.json()["detail"]

    # 2. Booking inside availability (11:00)
    good_resp = client.post("/sessions", headers=student["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "11:00:00",
        "duration_minutes": 60,
        "topic": "Architecture Review",
        "student_message": "Need advice on database scaling"
    })
    assert good_resp.status_code == 201
    session_data = good_resp.json()
    assert session_data["status"] == "pending"
    assert session_data["coach_id"] == coach["profile"]["id"]
    assert session_data["student_id"] == student["profile"]["id"]
    assert session_data["topic"] == "Architecture Review"

    # 3. Overlapping booking attempt (11:30 - 12:30 overlaps with 11:00 - 12:00)
    overlap_resp = client.post("/sessions", headers=student["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "11:30:00",
        "duration_minutes": 60,
        "topic": "Conflicting Session",
    })
    assert overlap_resp.status_code == 409

    # 4. Past date booking attempt
    past_date = (date.today() - timedelta(days=1)).isoformat()
    past_resp = client.post("/sessions", headers=student["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": past_date,
        "start_time": "11:00:00",
        "duration_minutes": 60,
        "topic": "Past Session",
    })
    assert past_resp.status_code == 422

def test_session_details_endpoint_and_authorization(client, create_student, create_coach):
    student1 = create_student(name="Student One")
    student2 = create_student(name="Student Two")
    coach = create_coach(name="Assigned Coach")

    client.put("/coaches/me/availability", headers=coach["headers"], json={
        "availability": "Mon-Sun 08:00 - 22:00"
    })

    future_date = (date.today() + timedelta(days=3)).isoformat()

    # Student 1 books session
    s_resp = client.post("/sessions", headers=student1["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "14:00:00",
        "duration_minutes": 45,
        "topic": "FastAPI Testing Patterns",
        "student_message": "Let's cover pytest and fixtures"
    })
    assert s_resp.status_code == 201
    session_id = s_resp.json()["id"]

    # 1. Student 1 views session details -> 200 OK
    det_student = client.get(f"/sessions/{session_id}", headers=student1["headers"])
    assert det_student.status_code == 200
    data = det_student.json()
    assert data["id"] == session_id
    assert data["student_name"] == "Student One"
    assert data["coach_name"] == "Assigned Coach"
    assert data["topic"] == "FastAPI Testing Patterns"

    # 2. Coach views session details -> 200 OK
    det_coach = client.get(f"/sessions/{session_id}", headers=coach["headers"])
    assert det_coach.status_code == 200
    assert det_coach.json()["id"] == session_id

    # 3. Student 2 (unauthorized) tries to view session details -> 403 Forbidden
    det_unauth = client.get(f"/sessions/{session_id}", headers=student2["headers"])
    assert det_unauth.status_code == 403

def test_acceptance_conflict_prevention(client, create_student, create_coach):
    student1 = create_student(name="Student A")
    student2 = create_student(name="Student B")
    coach = create_coach(name="Coach C")

    client.put("/coaches/me/availability", headers=coach["headers"], json={
        "availability": "Mon-Sun 08:00 - 22:00"
    })

    future_date = (date.today() + timedelta(days=4)).isoformat()

    # Student 1 requests 10:00 - 11:00
    r1 = client.post("/sessions", headers=student1["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "10:00:00",
        "duration_minutes": 60,
        "topic": "Topic A",
    })
    assert r1.status_code == 201
    s1_id = r1.json()["id"]

    # Coach accepts session 1
    acc1 = client.put(f"/sessions/{s1_id}/accept", headers=coach["headers"])
    assert acc1.status_code == 200
    assert acc1.json()["status"] == "accepted"

    # Now imagine another request exists or was created (e.g., student 2 booked adjacent time 11:00 - 12:00)
    r2 = client.post("/sessions", headers=student2["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "11:00:00",
        "duration_minutes": 60,
        "topic": "Topic B",
    })
    assert r2.status_code == 201
    s2_id = r2.json()["id"]

    # Coach accepts session 2 (non-overlapping) -> 200 OK
    acc2 = client.put(f"/sessions/{s2_id}/accept", headers=coach["headers"])
    assert acc2.status_code == 200

def test_full_session_lifecycle(client, create_student, create_coach):
    student = create_student()
    coach = create_coach()

    client.put("/coaches/me/availability", headers=coach["headers"], json={
        "availability": "Mon-Sun 08:00 - 22:00"
    })

    future_date = (date.today() + timedelta(days=6)).isoformat()

    # 1. Student creates session
    s_resp = client.post("/sessions", headers=student["headers"], json={
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "15:00:00",
        "duration_minutes": 60,
        "topic": "Lifecycle Verification",
        "student_message": "Full workflow test"
    })
    assert s_resp.status_code == 201
    session_id = s_resp.json()["id"]

    # 2. Coach accepts session
    acc_resp = client.put(f"/sessions/{session_id}/accept", headers=coach["headers"])
    assert acc_resp.status_code == 200
    assert acc_resp.json()["status"] == "accepted"

    # 3. Student cannot cancel an accepted session (only pending can be cancelled)
    cancel_bad = client.put(f"/sessions/{session_id}/cancel", headers=student["headers"])
    assert cancel_bad.status_code == 409

    # 4. Coach completes session with remarks
    comp_resp = client.put(f"/sessions/{session_id}/complete", headers=coach["headers"], json={
        "coach_remarks": "Excellent comprehension of system transactions and locking."
    })
    assert comp_resp.status_code == 200
    completed_data = comp_resp.json()
    assert completed_data["status"] == "completed"
    assert completed_data["coach_remarks"] == "Excellent comprehension of system transactions and locking."

    # 5. Student checks their sessions list
    my_sessions = client.get("/sessions/my", headers=student["headers"]).json()
    my_s = next(s for s in my_sessions if s["id"] == session_id)
    assert my_s["status"] == "completed"
    assert my_s["coach_remarks"] == "Excellent comprehension of system transactions and locking."

def test_concurrent_session_booking_prevents_double_booking(create_student, create_coach):
    from concurrent.futures import ThreadPoolExecutor
    from fastapi.testclient import TestClient
    from app.main import app

    student1 = create_student(name="Concurrent Student 1")
    student2 = create_student(name="Concurrent Student 2")
    coach = create_coach(name="Popular Coach")

    with TestClient(app) as test_client:
        test_client.put("/coaches/me/availability", headers=coach["headers"], json={
            "availability": "Mon-Sun 08:00 - 22:00"
        })

    future_date = (date.today() + timedelta(days=7)).isoformat()
    req_body = {
        "coach_id": coach["profile"]["id"],
        "session_date": future_date,
        "start_time": "16:00:00",
        "duration_minutes": 60,
        "topic": "Concurrency Overlap Test",
    }

    def book_session(headers):
        with TestClient(app) as c:
            return c.post("/sessions", headers=headers, json=req_body)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(book_session, student1["headers"])
        f2 = executor.submit(book_session, student2["headers"])
        resp1 = f1.result()
        resp2 = f2.result()

    statuses = sorted([resp1.status_code, resp2.status_code])
    # Exactly one must succeed (201) and one must be rejected with 409 Conflict
    assert statuses == [201, 409], f"Unexpected statuses: {statuses}"

