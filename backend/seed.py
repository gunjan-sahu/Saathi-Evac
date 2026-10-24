"""Loads FAKE demo data for one ward + demo logins. Run: python seed.py
Demo passwords are for local demos only."""
from app.database import Base, engine, SessionLocal
from app import models  # noqa: F401
from app.models import Helper, Shelter, User
from app.security import hash_password
from app.services import create_person
from app.schemas import PersonIn

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
db = SessionLocal()
db.add_all([
    Helper(name="Helper A", phone="9000000001", lat=26.450, lon=80.332, skills="stretcher"),
    Helper(name="Helper B", phone="9000000002", lat=26.455, lon=80.335, skills="medical"),
    Helper(name="Helper C", phone="9000000003", lat=26.470, lon=80.340, skills="stretcher,medical", women_led=True),
    Helper(name="Helper D", phone="9000000004", lat=26.460, lon=80.338, skills="stretcher"),
    Helper(name="Helper E", phone="9000000005", lat=26.465, lon=80.336, skills="medical"),
    Shelter(name="School Shelter", lat=26.452, lon=80.330, capacity=30, accessible=True),
    Shelter(name="Temple Hall", lat=26.448, lon=80.333, capacity=20, accessible=False),
])
db.commit()
users = [("coord", "Coord@12345", "coordinator", None), ("rescue", "Rescue@12345", "rescue", None),
         ("volunteer1", "Volunteer@12345", "volunteer", 1)]
for name, pw, role, hid in users:
    db.add(User(username=name, password_hash=hash_password(pw), role=role, full_name=name.title(), helper_id=hid))
db.commit()
coord = db.query(User).filter(User.username == "coord").first()
demo = [
    dict(name="Demo Person 1", age=82, phone="9100000001", language="hi", bedridden=True, oxygen_dependent=True, lives_alone=True, gender="female"),
    dict(name="Demo Person 2", age=68, phone="9100000002", mobility_aid=True, gender="male"),
    dict(name="Demo Person 3", age=77, phone="9100000003", language="hi", hearing_limit=True, lives_alone=True, gender="female", prefers_women_team=True),
]
for d in demo:
    create_person(db, PersonIn(ward="ward-7", lat=26.449, lon=80.331, consent=True, **d), coord.id)
db.commit()
print("Seeded. Logins (demo only): coord/Coord@12345, rescue/Rescue@12345, volunteer1/Volunteer@12345")
print("Start the server: uvicorn app.main:app --reload")
