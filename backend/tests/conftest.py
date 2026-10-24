import os
os.environ["DATABASE_URL"] = "sqlite:///./test_saathi.db"
os.environ["SECRET_KEY"] = "test-secret"
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

PW = "Passw0rd!x"


@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c


def _login(client, username):
    t = client.post("/auth/login", json=dict(username=username, password=PW)).json()["access_token"]
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture()
def coord(client):
    r = client.post("/auth/bootstrap", json=dict(username="boss", password=PW, full_name="Boss"))
    assert r.status_code == 200
    return _login(client, "boss")


@pytest.fixture()
def make_user(client, coord):
    def _make(role, username, helper_id=None):
        r = client.post("/auth/users", headers=coord, json=dict(
            username=username, password=PW, full_name=username, role=role, helper_id=helper_id))
        assert r.status_code == 200, r.text
        return _login(client, username)
    return _make
