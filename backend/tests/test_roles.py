PW = "Passw0rd!x"


def test_login_role_check(client, coord, make_user):
    make_user("volunteer", "role_vol")
    ok = client.post("/auth/login", json=dict(username="role_vol", password=PW, role="volunteer"))
    assert ok.status_code == 200 and ok.json()["role"] == "volunteer"
    bad = client.post("/auth/login", json=dict(username="role_vol", password=PW, role="coordinator"))
    assert bad.status_code == 403
    assert client.post("/auth/login", json=dict(username="role_vol", password=PW)).status_code == 200
