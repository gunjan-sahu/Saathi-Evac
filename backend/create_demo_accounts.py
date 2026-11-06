"""Creates (or resets) three DEMO logins for local demos, then checks each one works.
WARNING: the demo coordinator can see everything in the database it is created in.
Never run this against a database that holds real registrations."""
import sys

from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app import models  # noqa: F401
from app.main import app
from app.models import Helper, User
from app.security import hash_password

DEMO = [  # keep in sync with frontend/lib/demo.ts
    ("demo_coordinator", "DemoCoord@2026", "coordinator", "Demo Coordinator"),
    ("demo_volunteer", "DemoVolunteer@2026", "volunteer", "Demo Volunteer"),
    ("demo_rescue", "DemoRescue@2026", "rescue", "Demo Rescue Team"),
]

if str(engine.url).startswith("postgres") and "--force" not in sys.argv:
    sys.exit("Refusing to create demo accounts on a PostgreSQL database. Use --force only for a demo-only database.")

Base.metadata.create_all(engine)
db = SessionLocal()
for username, password, role, full_name in DEMO:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username, password_hash=hash_password(password), role=role, full_name=full_name)
        db.add(user)
    else:
        user.password_hash, user.role, user.full_name, user.active = hash_password(password), role, full_name, True
    db.flush()
    if role == "volunteer" and not user.helper_id:  # so the volunteer hub has a helper profile to show
        helper = Helper(name="Demo Helper", phone="0000000000", lat=26.4499, lon=80.3319, capacity=2, skills="")
        db.add(helper)
        db.flush()
        user.helper_id = helper.id
db.commit()
db.close()

ok = True
with TestClient(app) as client:
    for username, password, role, _ in DEMO:
        r = client.post("/auth/login", json={"username": username, "password": password, "role": role})
        if r.status_code != 200:
            ok = False
            print(f"FAILED  {role}: login returned {r.status_code}")
            continue
        me = client.get("/auth/me", headers={"Authorization": f"Bearer {r.json()['access_token']}"}).json()
        other = "rescue" if role != "rescue" else "coordinator"
        refused = client.post("/auth/login", json={"username": username, "password": password, "role": other}).status_code == 403
        good = me.get("role") == role and refused
        ok = ok and good
        print(f"{'OK    ' if good else 'FAILED'}  {role:<12} {username} / {password}   (wrong-portal login refused: {refused})")
print("\nAll three demo accounts work." if ok else "\nSomething failed. See above.")
