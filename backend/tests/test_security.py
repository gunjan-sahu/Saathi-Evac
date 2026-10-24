from tests.test_flow import person, add_helpers, start_event
from app import security


def test_no_token_and_bad_token(client):
    assert client.get("/people").status_code == 401
    assert client.get("/people", headers={"Authorization": "Bearer nope"}).status_code == 401


def test_expired_token(client, coord, monkeypatch):
    monkeypatch.setattr(security, "TOKEN_HOURS", -1)
    token = security.create_token(1, "coordinator")
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_bootstrap_only_once(client, coord):
    r = client.post("/auth/bootstrap", json=dict(username="evil", password="Passw0rd!x"))
    assert r.status_code == 403


def test_role_limits(client, coord, make_user):
    vol, rescue = make_user("volunteer", "vol"), make_user("rescue", "res")
    assert client.get("/dispatch/queue", headers=vol).status_code == 403
    assert client.post("/people", headers=rescue, json=person()).status_code == 403
    assert client.post("/alerts", headers=rescue, json={"ward": "w1"}).status_code == 403
    assert client.get("/dispatch/audit", headers=rescue).status_code == 403
    assert client.post("/auth/users", headers=vol, json=dict(
        username="x1x", password="Passw0rd!x", role="coordinator")).status_code == 403


def test_health_hidden_outside_event(client, coord):
    client.post("/people", headers=coord, json=person(bedridden=True))
    assert "priority_score" not in client.get("/people", headers=coord).json()[0]
    start_event(client, coord)
    assert "priority_score" in client.get("/people", headers=coord).json()[0]


def test_rescue_sees_health_only_in_event(client, coord, make_user):
    rescue = make_user("rescue", "res")
    client.post("/people", headers=coord, json=person(bedridden=True))
    assert client.get("/dispatch/queue", headers=rescue).json()[0]["health_visible"] is False
    start_event(client, coord)
    assert client.get("/dispatch/queue", headers=rescue).json()[0]["health_visible"] is True


def test_volunteer_sees_health_only_if_assigned(client, coord, make_user):
    hid = client.post("/helpers", headers=coord, json=dict(
        name="H0", phone="2", lat=26.45, lon=80.331)).json()["id"]
    assigned, other, stranger = (make_user("volunteer", "vol_one", helper_id=hid),
                                 make_user("volunteer", "vol_two"), make_user("volunteer", "vol_three"))
    start_event(client, coord)
    pid = client.post("/people", headers=other, json=person(bedridden=True)).json()["id"]
    assert "priority_score" not in client.get(f"/people/{pid}", headers=other).json()
    assert "priority_score" in client.get(f"/people/{pid}", headers=assigned).json()
    assert client.get(f"/people/{pid}", headers=stranger).status_code == 403


def test_access_is_logged(client, coord):
    start_event(client, coord)
    client.post("/people", headers=coord, json=person(bedridden=True))
    log = client.get("/audit/access", headers=coord).json()
    assert log and log[0]["action"] == "view_health"


def test_consent_revoke_erases_and_stops_warnings(client, coord):
    start_event(client, coord)
    pid = client.post("/people", headers=coord, json=person(bedridden=True)).json()["id"]
    assert client.post(f"/people/{pid}/consent/revoke", headers=coord).status_code == 200
    assert client.get("/dispatch/queue", headers=coord).json() == []
    assert client.post("/alerts", headers=coord, json={"ward": "w1"}).json()["people_warned"] == 0
    assert client.get(f"/people/{pid}", headers=coord).status_code == 404


def test_login_lockout(client, coord, make_user):
    make_user("volunteer", "lockme")
    for _ in range(5):
        assert client.post("/auth/login", json=dict(username="lockme", password="wrong")).status_code == 401
    assert client.post("/auth/login", json=dict(username="lockme", password="Passw0rd!x")).status_code == 429


def test_anonymous_concern(client, coord, make_user):
    vol = make_user("volunteer", "vol")
    client.post("/concerns", headers=vol, json=dict(ward="w1", message="Unsafe toilets", anonymous=True))
    assert client.get("/concerns", headers=vol).status_code == 403
    assert client.get("/concerns", headers=coord).json()[0]["reported_by"] is None


def test_rules_are_public_and_exclude_gender(client):
    r = client.get("/rules")
    assert r.status_code == 200
    assert "gender" not in r.json()["weights"]
    assert "gender" in r.json()["never_used_as_input"]
