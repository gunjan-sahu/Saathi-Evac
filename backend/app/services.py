from .models import (Person, Shelter, Assignment, ConsentRecord, Event, NEED_FIELDS, now)
from .agents.matching import assign_helpers
from .agents.shelter import match_shelter

CONSENT_SCOPE = ("Collect needs, location and contact to warn and evacuate this person. "
                 "Health details are shared only with assigned helpers and rescue teams during an event.")


def create_person(db, data, user_id, method="in_person"):
    if data.client_id:
        existing = db.query(Person).filter(Person.client_id == data.client_id).first()
        if existing:
            return existing
    p = Person(**data.model_dump(), registered_by=user_id)
    db.add(p)
    db.flush()
    s = match_shelter(db, p)
    if s:
        p.shelter_id = s.id
        s.occupancy += 1
    assign_helpers(db, p)
    db.add(ConsentRecord(person_id=p.id, recorded_by=user_id, method=method,
                         language=p.language, scope=CONSENT_SCOPE))
    db.flush()
    return p


def revoke_consent(db, p):
    """Right to withdraw: erase personal data and release helpers and shelter."""
    for a in db.query(Assignment).filter(Assignment.person_id == p.id, Assignment.status != "replaced"):
        a.status, a.updated_at = "replaced", now()
    if p.shelter_id:
        s = db.get(Shelter, p.shelter_id)
        s.occupancy = max(0, s.occupancy - 1)
        p.shelter_id = None
    for f in NEED_FIELDS:
        setattr(p, f, False)
    p.name, p.phone, p.gender = "Withdrawn", "redacted", None
    p.lat = p.lon = 0.0
    p.prefers_women_team = False
    p.consent = False
    for c in db.query(ConsentRecord).filter(ConsentRecord.person_id == p.id, ConsentRecord.revoked_at == None):  # noqa: E711
        c.revoked_at = now()


def start_event(db, ward, name, user_id):
    ev = db.query(Event).filter(Event.ward == ward, Event.status == "active").first()
    if ev:
        return ev
    ev = Event(ward=ward, name=name, started_by=user_id)
    db.add(ev)
    db.flush()
    return ev
