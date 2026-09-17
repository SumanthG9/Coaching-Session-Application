import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def unique_id():
    return int(time.time() * 1000)

@pytest.fixture
def create_coach(client, unique_id):
    def _create(email=None, password="Password123!", name="Test Coach"):
        mail = email or f"coach_{unique_id}_{time.time_ns()}@example.com"
        reg_resp = client.post("/auth/register/coach", json={
            "name": name,
            "email": mail,
            "password": password,
            "role": "coach"
        })
        assert reg_resp.status_code == 201, reg_resp.text
        
        login_resp = client.post("/auth/login", json={
            "email": mail,
            "password": password
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        
        # Get profile ID
        prof_resp = client.get("/coaches/me", headers={"Authorization": f"Bearer {token}"})
        assert prof_resp.status_code == 200
        profile = prof_resp.json()
        
        return {
            "token": token,
            "email": mail,
            "profile": profile,
            "headers": {"Authorization": f"Bearer {token}"}
        }
    return _create

@pytest.fixture
def create_student(client, unique_id):
    def _create(email=None, password="Password123!", name="Test Student"):
        mail = email or f"student_{unique_id}_{time.time_ns()}@example.com"
        reg_resp = client.post("/auth/register/student", json={
            "name": name,
            "email": mail,
            "password": password,
            "role": "student"
        })
        assert reg_resp.status_code == 201, reg_resp.text
        
        login_resp = client.post("/auth/login", json={
            "email": mail,
            "password": password
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        
        prof_resp = client.get("/students/me", headers={"Authorization": f"Bearer {token}"})
        assert prof_resp.status_code == 200
        profile = prof_resp.json()
        
        return {
            "token": token,
            "email": mail,
            "profile": profile,
            "headers": {"Authorization": f"Bearer {token}"}
        }
    return _create
