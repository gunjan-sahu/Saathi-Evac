"""Matching agent: picks helpers, re-assigns when a helper goes silent."""
from datetime import timedelta, timezone
from math import radians, sin, cos, asin, sqrt
from ..models import Helper, Assignment, ReassignmentLog, Person, now

ACTIVE = ("assigned", "on_my_way", "need_backup")  # still working on the person


def km(lat1, lon1, lat2, lon2):
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def as_utc(d):
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def load(db, helper_id):
    return db.query(Assignment).filter(
        Assignment.helper_id == helper_id, Assignment.status.in_(ACTIVE)).count()


def rank_helpers(db, person, exclude_ids=()):
    """Best helper first. Lower score = better (distance minus skill/preference bonus)."""
    ranked = []
    for h in db.query(Helper).filter(Helper.status != "unreachable").all():
        if h.id in exclude_ids or load(db, h.id) >= h.capacity:
            continue
        skills = (h.skills or "").split(",")
        s = km(person.lat, person.lon, h.lat, h.lon)
        if person.bedridden and "stretcher" in skills:
            s -= 3
        if (person.oxygen_dependent or person.dialysis) and "medical" in skills:
            s -= 2
        if person.prefers_women_team and h.women_led:  # the person's own request
            s -= 10
        ranked.append((s, h))
    ranked.sort(key=lambda x: x[0])
    return [h for _, h in ranked]


def assign_helpers(db, person, n=2):
    chosen = rank_helpers(db, person)[:n]
    for h in chosen:
        db.add(Assignment(person_id=person.id, helper_id=h.id))
    db.flush()
    return chosen


def add_backup(db, person_id):
    person = db.get(Person, person_id)
    used = [a.helper_id for a in db.query(Assignment).filter(Assignment.person_id == person_id)]
    ranked = rank_helpers(db, person, exclude_ids=used)
    if not ranked:
        return None
    db.add(Assignment(person_id=person_id, helper_id=ranked[0].id))
    db.add(ReassignmentLog(person_id=person_id, to_helper_id=ranked[0].id, reason="Backup requested"))
    return ranked[0]


def silent_helpers(db, minutes):
    """Helpers with active work whose last sign of life is older than `minutes`."""
    cutoff = now() - timedelta(minutes=minutes)
    out = []
    for h in db.query(Helper).filter(Helper.status != "unreachable").all():
        acts = db.query(Assignment).filter(Assignment.helper_id == h.id,
                                           Assignment.status.in_(ACTIVE)).all()
        if not acts:
            continue
        times = [as_utc(a.updated_at) for a in acts]
        if h.last_checkin:
            times.append(as_utc(h.last_checkin))
        if max(times) < cutoff:
            out.append(h)
    return out


def reassign_for_helper(db, helper_id, reason="Missed check-in"):
    helper = db.get(Helper, helper_id)
    helper.status = "unreachable"
    logs = []
    for a in db.query(Assignment).filter(
            Assignment.helper_id == helper_id, Assignment.status.in_(ACTIVE)).all():
        a.status, a.updated_at = "replaced", now()
        person = db.get(Person, a.person_id)
        used = [x.helper_id for x in db.query(Assignment).filter(Assignment.person_id == a.person_id)]
        ranked = rank_helpers(db, person, exclude_ids=used)
        new = ranked[0] if ranked else None
        if new:
            db.add(Assignment(person_id=a.person_id, helper_id=new.id))
        log = ReassignmentLog(person_id=a.person_id, from_helper_id=helper_id,
                              to_helper_id=new.id if new else None,
                              reason=reason if new else reason + " - NO HELPER AVAILABLE")
        db.add(log)
        logs.append(log)
        db.flush()
    return logs
