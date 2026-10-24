def person(**kw):
    base = dict(name="P", age=80, phone="1", ward="w1", lat=26.449, lon=80.331, consent=True)
    base.update(kw)
    return base


def add_helpers(c, h, women_led_index=None):
    for i, lat in enumerate([26.450, 26.460, 26.470]):
        c.post("/helpers", headers=h, json=dict(name=f"H{i}", phone="2", lat=lat, lon=80.331,
                                                women_led=(i == women_led_index)))


def start_event(c, h, ward="w1"):
    return c.post("/events", headers=h, json={"ward": ward, "name": "flood"}).json()["id"]


def test_consent_required(client, coord):
    assert client.post("/people", headers=coord, json=person(consent=False)).status_code == 400


def test_gender_does_not_change_score(client, coord):
    start_event(client, coord)
    a = client.post("/people", headers=coord, json=person(bedridden=True, gender="male")).json()
    b = client.post("/people", headers=coord, json=person(bedridden=True, gender="female")).json()
    assert a["priority_score"] == b["priority_score"]


def test_live_reassignment(client, coord):
    add_helpers(client, coord)
    start_event(client, coord)
    p = client.post("/people", headers=coord, json=person(bedridden=True)).json()
    assert p["helpers"] == ["H0", "H1"]
    logs = client.post("/helpers/1/missed-checkin", headers=coord).json()
    assert logs[0]["to"] == 3
    assert client.get("/dispatch/queue", headers=coord).json()[0]["helpers"] == ["H1", "H2"]


def test_alert_starts_event_and_queue_order(client, coord):
    add_helpers(client, coord)
    client.post("/people", headers=coord, json=person(name="Low", age=60))
    client.post("/people", headers=coord, json=person(name="High", bedridden=True))
    assert client.post("/alerts", headers=coord, json={"ward": "w1"}).json()["people_warned"] == 2
    assert client.get("/dispatch/queue", headers=coord).json()[0]["name"] == "High"


def test_sweep_reassigns_silent_helpers(client, coord):
    add_helpers(client, coord)
    client.post("/people", headers=coord, json=person(bedridden=True))
    r = client.post("/helpers/sweep?minutes=0", headers=coord).json()
    assert 1 in r["helpers_marked_unreachable"] and r["reassignments"]


def test_need_backup_adds_helper(client, coord):
    add_helpers(client, coord)
    start_event(client, coord)
    client.post("/people", headers=coord, json=person(bedridden=True))
    r = client.post("/helpers/assignments/1/status?status=need_backup", headers=coord).json()
    assert r["backup_helper_id"] == 3


def test_women_led_preference(client, coord):
    add_helpers(client, coord, women_led_index=1)
    start_event(client, coord)
    p = client.post("/people", headers=coord, json=person(prefers_women_team=True)).json()
    assert p["helpers"][0] == "H1"
