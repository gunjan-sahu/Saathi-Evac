from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Person
from ..schemas import PersonIn
from ..security import require_roles
from ..privacy import person_view, can_access_person
from ..services import create_person, revoke_consent

router = APIRouter(prefix="/people", tags=["people"])


def get_person_or_404(db, user, person_id):
    p = db.get(Person, person_id)
    if not p or not p.consent:
        raise HTTPException(404, "Person not found")
    if not can_access_person(db, user, p):
        raise HTTPException(403, "You are not allowed to see this person")
    return p


@router.post("")
def register(data: PersonIn, user=Depends(require_roles("volunteer", "coordinator")),
             db: Session = Depends(get_db)):
    if not data.consent:
        raise HTTPException(400, "Consent is required to register a person")
    p = create_person(db, data, user.id)
    view = person_view(db, user, p)
    db.commit()
    return view


@router.get("")
def list_people(ward: str | None = None,
                user=Depends(require_roles("volunteer", "coordinator", "rescue")),
                db: Session = Depends(get_db)):
    q = db.query(Person).filter(Person.consent == True)  # noqa: E712
    if ward:
        q = q.filter(Person.ward == ward)
    rows = [person_view(db, user, p) for p in q.all() if can_access_person(db, user, p)]
    db.commit()
    return rows


@router.get("/{person_id}")
def get_person(person_id: int, user=Depends(require_roles("volunteer", "coordinator", "rescue")),
               db: Session = Depends(get_db)):
    view = person_view(db, user, get_person_or_404(db, user, person_id))
    db.commit()
    return view


@router.post("/{person_id}/reply")
def phone_reply(person_id: int, safe: bool, user=Depends(require_roles("volunteer", "coordinator")),
                db: Session = Depends(get_db)):
    """Simulates the keypad reply: safe=true (press 1) or safe=false (press 2)."""
    p = get_person_or_404(db, user, person_id)
    p.safe_confirmed, p.needs_help = safe, not safe
    view = person_view(db, user, p)
    db.commit()
    return view


@router.post("/{person_id}/consent/revoke")
def revoke(person_id: int, user=Depends(require_roles("volunteer", "coordinator")),
           db: Session = Depends(get_db)):
    p = get_person_or_404(db, user, person_id)
    revoke_consent(db, p)
    db.commit()
    return {"id": p.id, "status": "consent withdrawn, personal data erased"}
