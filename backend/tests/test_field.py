from tests.test_flow import person


def test_client_id_prevents_duplicates(client, coord):
    p = person(client_id="abc-1")
    a = client.post("/people", headers=coord, json=p).json()
    b = client.post("/people", headers=coord, json=p).json()
    assert a["id"] == b["id"]
    assert len(client.get("/people", headers=coord).json()) == 1


def test_volunteer_self_register_and_checkin(client, coord, make_user):
    vol = make_user("volunteer", "field_vol")
    r = client.post("/helpers", headers=vol, json=dict(name="Me", phone="2", lat=26.45, lon=80.331))
    assert r.status_code == 200
    assert client.get("/auth/me", headers=vol).json()["helper_id"] == r.json()["id"]
    client.post("/people", headers=coord, json=person())
    tasks = client.get("/helpers/me/assignments", headers=vol).json()
    assert len(tasks) == 1 and tasks[0]["person"]["health_visible"] is False
    url = f"/helpers/assignments/{tasks[0]['assignment_id']}/status?status=on_my_way"
    assert client.post(url, headers=vol).status_code == 200
