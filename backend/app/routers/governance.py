from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, Concern, AccessLog, Person, now
from ..schemas import EventIn, ConcernIn
from ..security import require_roles
from ..services import start_event
from ..agents.triage import published_rules
from .. import messages

router = APIRouter(tags=["governance"])


@router.get("/rules")
def rules():
    """Public on purpose: officials and NGOs can audit how people are ranked."""
    return published_rules()


@router.get("/languages")
def languages():
    """Warning languages available, with their review status."""
    return messages.languages()


@router.post("/events")
def begin_event(data: EventIn, user=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    ev = start_event(db, data.ward, data.name, user.id)
    db.commit()
    return {"id": ev.id, "ward": ev.ward, "status": ev.status}


@router.post("/events/{event_id}/end")
def end_event(event_id: int, _=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    ev = db.get(Event, event_id)
    if not ev:
        raise HTTPException(404, "Event not found")
    ev.status, ev.ended_at = "closed", now()
    db.commit()
    return {"id": ev.id, "status": ev.status}


@router.get("/events")
def list_events(_=Depends(require_roles("coordinator", "rescue")), db: Session = Depends(get_db)):
    return [{"id": e.id, "ward": e.ward, "name": e.name, "status": e.status,
             "started_at": e.started_at, "ended_at": e.ended_at} for e in db.query(Event).all()]


@router.post("/concerns")
def report_concern(data: ConcernIn, user=Depends(require_roles("volunteer", "coordinator")),
                   db: Session = Depends(get_db)):
    """Confidential: if anonymous, we do not store who reported it."""
    if data.person_id and not db.get(Person, data.person_id):
        raise HTTPException(404, "Person not found")
    c = Concern(ward=data.ward, person_id=data.person_id, message=data.message,
                reported_by=None if data.anonymous else user.id)
    db.add(c)
    db.commit()
    return {"id": c.id, "status": c.status}


@router.get("/concerns")
def list_concerns(_=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    return [{"id": c.id, "ward": c.ward, "person_id": c.person_id, "message": c.message,
             "reported_by": c.reported_by, "status": c.status, "created_at": c.created_at}
            for c in db.query(Concern).order_by(Concern.id.desc()).all()]


@router.post("/concerns/{concern_id}/resolve")
def resolve_concern(concern_id: int, _=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    c = db.get(Concern, concern_id)
    if not c:
        raise HTTPException(404, "Concern not found")
    c.status = "resolved"
    db.commit()
    return {"id": c.id, "status": c.status}


@router.get("/audit/access")
def access_log(limit: int = Query(100, ge=1, le=1000), _=Depends(require_roles("coordinator")),
               db: Session = Depends(get_db)):
    """Who looked at whose health details, and when."""
    rows = db.query(AccessLog).order_by(AccessLog.id.desc()).limit(limit).all()
    return [{"user_id": r.user_id, "action": r.action, "person_id": r.person_id,
             "time": r.created_at} for r in rows]
