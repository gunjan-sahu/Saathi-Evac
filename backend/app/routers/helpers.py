from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Helper, Assignment, now
from ..schemas import HelperIn
from ..security import require_roles, get_current_user
from ..agents.matching import reassign_for_helper, add_backup, silent_helpers

router = APIRouter(prefix="/helpers", tags=["helpers"])
VALID = {"on_my_way", "reached", "need_backup"}


@router.post("")
def add_helper(data: HelperIn, user=Depends(require_roles("volunteer", "coordinator")),
               db: Session = Depends(get_db)):
    """A volunteer registering themselves is linked to their own login."""
    if user.role == "volunteer" and user.helper_id:
        raise HTTPException(400, "You already have a helper profile")
    h = Helper(**data.model_dump())
    db.add(h)
    db.flush()
    if user.role == "volunteer":
        user.helper_id = h.id
    db.commit()
    return {"id": h.id, "name": h.name}


@router.get("")
def list_helpers(_=Depends(require_roles("coordinator", "rescue")), db: Session = Depends(get_db)):
    return [{"id": h.id, "name": h.name, "status": h.status, "skills": h.skills,
             "capacity": h.capacity} for h in db.query(Helper).all()]


@router.post("/assignments/{assignment_id}/status")
def update_status(assignment_id: int, status: str, user=Depends(get_current_user),
                  db: Session = Depends(get_db)):
    if status not in VALID:
        raise HTTPException(400, f"status must be one of {sorted(VALID)}")
    a = db.get(Assignment, assignment_id)
    if not a:
        raise HTTPException(404, "Assignment not found")
    if user.role != "coordinator" and user.helper_id != a.helper_id:
        raise HTTPException(403, "This is not your assignment")
    a.status, a.updated_at = status, now()
    db.get(Helper, a.helper_id).last_checkin = now()
    backup = add_backup(db, a.person_id) if status == "need_backup" else None
    db.commit()
    return {"assignment_id": a.id, "status": a.status,
            "backup_helper_id": backup.id if backup else None}


@router.post("/{helper_id}/heartbeat")
def heartbeat(helper_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Helper phone says 'I am alive'. A returning helper becomes available again."""
    h = db.get(Helper, helper_id)
    if not h:
        raise HTTPException(404, "Helper not found")
    if user.role != "coordinator" and user.helper_id != helper_id:
        raise HTTPException(403, "This is not your helper profile")
    h.last_checkin, h.status = now(), "available"
    db.commit()
    return {"id": h.id, "status": h.status}


@router.post("/sweep")
def sweep(minutes: int = Query(15, ge=0), _=Depends(require_roles("coordinator")),
          db: Session = Depends(get_db)):
    """Finds helpers silent for `minutes` and re-assigns their people automatically."""
    marked, out = [], []
    for h in silent_helpers(db, minutes):
        marked.append(h.id)
        for l in reassign_for_helper(db, h.id, f"Silent for {minutes}+ min"):
            out.append({"person_id": l.person_id, "from": l.from_helper_id,
                        "to": l.to_helper_id, "reason": l.reason})
    db.commit()
    return {"helpers_marked_unreachable": marked, "reassignments": out}


@router.post("/{helper_id}/missed-checkin")
def missed_checkin(helper_id: int, _=Depends(require_roles("coordinator")),
                   db: Session = Depends(get_db)):
    if not db.get(Helper, helper_id):
        raise HTTPException(404, "Helper not found")
    logs = reassign_for_helper(db, helper_id)
    db.commit()
    return [{"person_id": l.person_id, "from": l.from_helper_id, "to": l.to_helper_id,
             "reason": l.reason} for l in logs]
