from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Helper
from ..schemas import LoginIn, BootstrapIn, UserIn
from ..security import (hash_password, verify_password, create_token, get_current_user,
                        require_roles, check_lockout, record_fail, clear_fails, ROLES)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/bootstrap")
def bootstrap(data: BootstrapIn, db: Session = Depends(get_db)):
    """Creates the FIRST coordinator. Only works while there are no users."""
    if db.query(User).count() > 0:
        raise HTTPException(403, "Already set up. Ask a coordinator to create your account.")
    u = User(username=data.username.lower(), password_hash=hash_password(data.password),
             role="coordinator", full_name=data.full_name)
    db.add(u)
    db.commit()
    return {"id": u.id, "username": u.username, "role": u.role}


@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    name = data.username.lower()
    check_lockout(name)
    u = db.query(User).filter(User.username == name).first()
    if not u or not u.active or not verify_password(data.password, u.password_hash):
        record_fail(name)
        raise HTTPException(401, "Wrong username or password")
    clear_fails(name)
    return {"access_token": create_token(u.id, u.role), "token_type": "bearer", "role": u.role}


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "role": user.role,
            "full_name": user.full_name, "helper_id": user.helper_id}


@router.post("/users")
def create_user(data: UserIn, _=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    if data.role not in ROLES:
        raise HTTPException(400, f"role must be one of {list(ROLES)}")
    if db.query(User).filter(User.username == data.username.lower()).first():
        raise HTTPException(409, "Username already taken")
    if data.helper_id and not db.get(Helper, data.helper_id):
        raise HTTPException(404, "Helper not found")
    u = User(username=data.username.lower(), password_hash=hash_password(data.password),
             full_name=data.full_name, role=data.role, helper_id=data.helper_id)
    db.add(u)
    db.commit()
    return {"id": u.id, "username": u.username, "role": u.role}


@router.get("/users")
def list_users(_=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    return [{"id": u.id, "username": u.username, "role": u.role, "active": u.active,
             "helper_id": u.helper_id} for u in db.query(User).all()]


@router.post("/users/{user_id}/deactivate")
def deactivate(user_id: int, me=Depends(require_roles("coordinator")), db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(404, "User not found")
    if u.id == me.id:
        raise HTTPException(400, "You cannot deactivate yourself")
    u.active = False
    db.commit()
    return {"id": u.id, "active": u.active}
