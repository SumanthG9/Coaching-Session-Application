import pytest

def test_coach_profile_and_availability(client, create_coach):
    coach = create_coach()

    # Update full profile
    up_resp = client.put("/coaches/me", headers=coach["headers"], json={
        "bio": "Expert in Distributed Systems & Python",
        "years_experience": 8,
        "session_fee": 95.0,
        "availability": "Mon-Fri 09:00 - 17:00"
    })
    assert up_resp.status_code == 200
    data = up_resp.json()
    assert data["years_experience"] == 8
    assert float(data["session_fee"]) == 95.0
    assert data["availability"] == "Mon-Fri 09:00 - 17:00"

    # Dedicated availability endpoint
    avail_resp = client.put("/coaches/me/availability", headers=coach["headers"], json={
        "availability": "Mon-Sun 10:00 - 20:00"
    })
    assert avail_resp.status_code == 200
    assert avail_resp.json()["availability"] == "Mon-Sun 10:00 - 20:00"

    # Negative fee validation
    bad_fee = client.put("/coaches/me", headers=coach["headers"], json={
        "bio": "Expert",
        "years_experience": 5,
        "session_fee": -10.0,
        "availability": "Mon-Fri 09:00 - 17:00"
    })
    assert bad_fee.status_code == 422

    # Negative experience validation
    bad_exp = client.put("/coaches/me", headers=coach["headers"], json={
        "bio": "Expert",
        "years_experience": -2,
        "session_fee": 50.0,
        "availability": "Mon-Fri 09:00 - 17:00"
    })
    assert bad_exp.status_code == 422

def test_coach_skills_and_search(client, create_coach, create_student):
    coach = create_coach(name="Skillful Coach")
    student = create_student()

    # Add skills
    s1 = client.post("/coaches/me/skills", headers=coach["headers"], json={"skill_name": "Docker"})
    assert s1.status_code == 201
    s1_id = s1.json()["id"]

    s2 = client.post("/coaches/me/skills", headers=coach["headers"], json={"skill_name": "Kubernetes"})
    assert s2.status_code == 201

    # Search coaches by skill as student
    search_resp = client.get("/coaches?skill=Docker", headers=student["headers"])
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert any(c["id"] == coach["profile"]["id"] for c in results)

    # Delete skill
    del_resp = client.delete(f"/coaches/me/skills/{s1_id}", headers=coach["headers"])
    assert del_resp.status_code in (200, 204)

