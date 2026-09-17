import time
import pytest

def test_student_and_coach_registration(client):
    ts = int(time.time() * 1000)
    student_email = f"std_reg_{ts}@example.com"
    coach_email = f"cch_reg_{ts}@example.com"
    password = "SecurePassword123!"

    # 1. Register student
    resp = client.post("/auth/register/student", json={
        "name": "Alice Smith",
        "email": student_email,
        "password": password,
        "role": "student"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == student_email
    assert data["name"] == "Alice Smith"
    assert data["role"] == "student"
    assert "password" not in data
    assert "password_hash" not in data

    # 2. Register coach
    resp = client.post("/auth/register/coach", json={
        "name": "Bob Vance",
        "email": coach_email,
        "password": password,
        "role": "coach"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == coach_email
    assert data["name"] == "Bob Vance"
    assert data["role"] == "coach"
    assert "password" not in data
    assert "password_hash" not in data

    # 3. Duplicate email rejected
    dup_resp = client.post("/auth/register/student", json={
        "name": "Duplicate User",
        "email": student_email,
        "password": password,
        "role": "student"
    })
    assert dup_resp.status_code == 409

def test_login_and_token_authentication(client):
    ts = int(time.time() * 1000)
    email = f"login_test_{ts}@example.com"
    password = "MyPassword123!"

    # Register
    client.post("/auth/register/student", json={
        "name": "Login Tester",
        "email": email,
        "password": password,
        "role": "student"
    })

    # Successful login
    login_resp = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


    # Invalid password login
    bad_login = client.post("/auth/login", json={
        "email": email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

def test_role_based_access_control(client, create_student, create_coach):
    student = create_student()
    coach = create_coach()

    # Student cannot access coach me
    resp1 = client.get("/coaches/me", headers=student["headers"])
    assert resp1.status_code == 403

    # Coach cannot access student me
    resp2 = client.get("/students/me", headers=coach["headers"])
    assert resp2.status_code == 403
