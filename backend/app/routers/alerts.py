from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import AlertIn
from ..security import require_roles
from ..services import start_event
from ..agents.warning import run_warning

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("")
def trigger_alert(data: AlertIn, user=Depends(require_roles("coordinator")),
                  db: Session = Depends(get_db)):
    """Manual officer trigger. Starts the event for the ward if none is active.
    CAP feed integration comes in a later step."""
    ev = start_event(db, data.ward, "Alert", user.id)
    db.commit()
    return {"ward": data.ward, "event_id": ev.id,
            "people_warned": run_warning(db, data.ward, data.message)}
