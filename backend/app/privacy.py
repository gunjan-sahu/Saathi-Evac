"""Privacy rules: health details are visible only during an active event, and only to
rescue teams, coordinators, and helpers assigned to that person. Every view is logged."""
from .models import Event, Assignment, Helper, Shelter, AccessLog
from .agents.triage import score_person


def event_active(db, ward):
    return db.query(Event).filter(Event.ward == ward, Event.status == "active").first() is not None


def _is_assigned(db, user, p):
    return bool(user.helper_id) and db.query(Assignment).filter(
        Assignment.person_id == p.id, Assignment.helper_id == user.helper_id,
        Assignment.status != "replaced").count() > 0


def can_access_person(db, user, p):
    if user.role in ("coordinator", "rescue") or p.registered_by == user.id:
        return True
    return _is_assigned(db, user, p)


def can_see_health(db, user, p):
    if not event_active(db, p.ward):
        return False
    if user.role in ("coordinator", "rescue"):
        return True
    return user.role == "volunteer" and _is_assigned(db, user, p)


def log_access(db, user, action, person_id=None):
    db.add(AccessLog(user_id=user.id, action=action, person_id=person_id))


def person_view(db, user, p):
    helpers = [h.name for h in db.query(Helper).join(Assignment, Assignment.helper_id == Helper.id)
               .filter(Assignment.person_id == p.id, Assignment.status != "replaced")
               .order_by(Assignment.id)]
    shelter = db.get(Shelter, p.shelter_id) if p.shelter_id else None
    view = {"id": p.id, "name": p.name, "ward": p.ward, "helpers": helpers,
            "shelter": shelter.name if shelter else None,
            "safe_confirmed": p.safe_confirmed, "needs_help": p.needs_help}
    if can_see_health(db, user, p):
        score, reasons = score_person(p)
        view.update(priority_score=score, reasons=reasons, health_visible=True)
        log_access(db, user, "view_health", p.id)
    else:
        view["health_visible"] = False  # score and reasons are hidden
    return view
