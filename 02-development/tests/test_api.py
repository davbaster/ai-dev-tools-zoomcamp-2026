from fastapi.testclient import TestClient

from backend.app import app, reset_store


def client_for(role="host"):
    reset_store()
    return TestClient(app, headers={"X-Staff-Role": role})


def walkin():
    return {"party_name": "The Nguyen party", "party_size": 5, "phone": "555-0100", "special_request": "High chair", "estimated_arrival_time": "18:45", "estimated_wait_time": 15}


def test_health_and_role_access():
    assert TestClient(app).get("/health").json() == {"status": "ok"}
    assert client_for("server").post("/entries/walk-ins", json=walkin()).status_code == 403


def test_host_creates_searches_and_cannot_edit_a_walkin():
    client = client_for()
    created = client.post("/entries/walk-ins", json=walkin())
    assert created.status_code == 201
    entry = created.json()
    assert entry["status"] == "waiting" and entry["created_at"]
    assert client.get("/entries", params={"q": "nguyen"}).json()[0]["id"] == entry["id"]
    assert client.patch(f"/entries/{entry['id']}", json={"party_name": "Edited"}).status_code == 405


def test_assignment_warning_seating_and_server_release():
    host = client_for()
    entry = host.post("/entries/walk-ins", json=walkin()).json()
    assigned = host.post(f"/entries/{entry['id']}/assignments", json={"table_ids": ["t1"]})
    assert assigned.json()["capacity_warning"] is True
    seated = host.post(f"/entries/{entry['id']}/seat")
    assert seated.status_code == 200 and seated.json()["status"] == "seated"
    assert host.get("/tables").json()[0]["availability"] == "occupied"
    server = client_for("server")
    # reset_store creates an occupied seeded table for the service workflow.
    assert server.post("/tables/t2/release").status_code == 200


def test_reservation_conflict_requires_confirmation():
    client = client_for()
    reservation = {**walkin(), "reservation_date": "2026-09-14", "reservation_time": "19:00"}
    first = client.post("/entries/reservations", json=reservation).json()
    assert client.post(f"/entries/{first['id']}/assignments", json={"table_ids": ["t3"]}).status_code == 200
    second = client.post("/entries/reservations", json={**reservation, "party_name": "Other"}).json()
    warning = client.post(f"/entries/{second['id']}/assignments", json={"table_ids": ["t3"]})
    assert warning.status_code == 409 and warning.json()["overlap_warning"] is True
    assert client.post(f"/entries/{second['id']}/assignments", json={"table_ids": ["t3"], "confirm_overlap": True}).status_code == 200


def test_manager_admin_and_daily_report():
    manager = client_for("manager")
    assert manager.post("/staff", json={"name": "Nora Kim", "role": "server"}).status_code == 201
    assert manager.post("/tables", json={"label": "11", "capacity": 2}).status_code == 201
    report = manager.get("/reports/daily", params={"date": "2026-09-14"})
    assert report.status_code == 200
    assert {"average_wait_minutes", "cancellations", "no_shows", "table_turnover", "covers_served"} <= report.json().keys()
