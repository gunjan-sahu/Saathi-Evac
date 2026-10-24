"""Login + role checks using only the Python standard library (no extra installs)."""
import base64, hashlib, hmac, json, os, secrets, time
from collections import defaultdict
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")
TOKEN_HOURS = int(os.getenv("TOKEN_HOURS", "12"))
ROLES = ("volunteer", "coordinator", "rescue")
bearer = HTTPBearer(auto_error=False)


def hash_password(pw: str) -> str:
    salt = secrets.token_bytes(16)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 200_000)
    return salt.hex() + "$" + h.hex()


def verify_password(pw: str, stored: str) -> bool:
    try:
        salt_hex, h_hex = stored.split("$")
        h = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt_hex), 200_000)
    except ValueError:
        return False
    return hmac.compare_digest(h.hex(), h_hex)


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _sign(body: str) -> str:
    return _b64(hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).digest())


def create_token(user_id: int, role: str) -> str:
    payload = {"sub": user_id, "role": role, "exp": int(time.time()) + TOKEN_HOURS * 3600}
    body = _b64(json.dumps(payload).encode())
    return f"{body}.{_sign(body)}"


def decode_token(token: str):
    try:
        body, sig = token.split(".")
        if not hmac.compare_digest(sig, _sign(body)):
            return None
        data = json.loads(_unb64(body))
        return data if data["exp"] >= time.time() else None
    except Exception:
        return None


# --- simple brute-force protection: 5 wrong passwords = locked for 5 minutes ---
_fails = defaultdict(list)


def check_lockout(username: str):
    recent = [t for t in _fails[username] if time.time() - t < 300]
    _fails[username] = recent
    if len(recent) >= 5:
        raise HTTPException(429, "Too many wrong attempts. Try again in 5 minutes.")


def record_fail(username: str):
    _fails[username].append(time.time())


def clear_fails(username: str):
    _fails.pop(username, None)


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer),
                     db: Session = Depends(get_db)):
    from .models import User
    if not creds:
        raise HTTPException(401, "Login required")
    data = decode_token(creds.credentials)
    if not data:
        raise HTTPException(401, "Invalid or expired token")
    user = db.get(User, data["sub"])
    if not user or not user.active:
        raise HTTPException(401, "Account not active")
    return user  # role comes from the database, not from the token


def require_roles(*roles):
    def check(user=Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(403, f"Your role '{user.role}' is not allowed to do this")
        return user
    return check
