from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Person, Shelter, ReassignmentLog, Assignment
from ..schemas import ShelterIn
from ..security import require_roles
from ..privacy import person_view
from ..agents.triage import score_person
from ..agents.matching import ACTIVE

router = APIRouter(prefix="/dispatch", tags=["dispatch"])
ALL = ("volunteer", "coordinator", "rescue")


@router.get("/queue")
def queue(ward: str | None = None, user=Depends(require_roles("coordinator", "rescue")),
          db: Session = Depends(get_db)):
    q = db.query(Person).filter(Person.consent == True)  # noqa: E712
    if ward:
        q = q.filter(Person.ward == ward)
    # people who pressed "need help" go first, then by score (score only if visible)
    people = sorted(q.all(), key=lambda p: (not p.needs_help, -score_person(p)[0]))
    rows = [person_view(db, user, p) for p in people]
    db.commit()
    return rows


@router.get("/reassignments")
def reassignments(_=Depends(require_roles("coordinator", "rescue")), db: Session = Depends(get_db)):
    return [{"person_id": l.person_id, "from_helper": l.from_helper_id, "to_helper": l.to_helper_id,
             "reason": l.reason, "time": l.created_at} for l in
            db.query(ReassignmentLog).order_by(ReassignmentLog.id.desc()).all()]


@router.post("/shelters")
def add_shelter(data: ShelterIn, _=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    s = Shelter(**data.model_dump())
    db.add(s)
    db.commit()
    return {"id": s.id, "name": s.name}


@router.get("/shelters")
def shelters(_=Depends(require_roles(*ALL)), db: Session = Depends(get_db)):
    return [{"id": s.id, "name": s.name, "capacity": s.capacity, "occupancy": s.occupancy}
            for s in db.query(Shelter).all()]


@router.get("/audit")
def audit(_=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    """Fairness check: outcomes by gender and age group. Aggregates only, no individuals."""
    groups = defaultdict(list)
    for p in db.query(Person).filter(Person.consent == True).all():  # noqa: E712
        age = "75+" if p.age >= 75 else "60-74" if p.age >= 60 else "under 60"
        for key in (f"gender:{p.gender or 'unspecified'}", f"age:{age}"):
            groups[key].append(p)
    out = {}
    for key, people in groups.items():
        covered = sum(1 for p in people if db.query(Assignment).filter(
            Assignment.person_id == p.id, Assignment.status.in_(ACTIVE + ("reached",))).count() > 0)
        out[key] = {"count": len(people),
                    "avg_priority_score": round(sum(score_person(p)[0] for p in people) / len(people), 1),
                    "pct_with_helper": round(100 * covered / len(people)),
                    "pct_with_shelter": round(100 * sum(1 for p in people if p.shelter_id) / len(people))}
    return out
