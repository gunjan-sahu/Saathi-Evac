from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from .database import Base

NEED_FIELDS = ["bedridden", "mobility_aid", "oxygen_dependent", "dialysis",
               "hearing_limit", "vision_limit", "infant_or_pregnancy", "lives_alone"]


def now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, default="")
    role = Column(String, nullable=False)  # volunteer / coordinator / rescue
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)


class Person(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    phone = Column(String, nullable=False)
    language = Column(String, default="en")
    ward = Column(String, index=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    consent = Column(Boolean, default=False)
    gender = Column(String, nullable=True)  # AUDIT ONLY. Never used in scoring.
    prefers_women_team = Column(Boolean, default=False)  # person's own request
    registered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # needs
    bedridden = Column(Boolean, default=False)
    mobility_aid = Column(Boolean, default=False)
    oxygen_dependent = Column(Boolean, default=False)
    dialysis = Column(Boolean, default=False)
    hearing_limit = Column(Boolean, default=False)
    vision_limit = Column(Boolean, default=False)
    infant_or_pregnancy = Column(Boolean, default=False)
    lives_alone = Column(Boolean, default=False)
    # state
    shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=True)
    safe_confirmed = Column(Boolean, default=False)
    needs_help = Column(Boolean, default=False)


class Helper(Base):
    __tablename__ = "helpers"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    capacity = Column(Integer, default=2)
    skills = Column(String, default="")  # comma list: stretcher,medical
    women_led = Column(Boolean, default=False)  # used only for pairing preference
    status = Column(String, default="available")  # available / unreachable
    last_checkin = Column(DateTime, nullable=True)


class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True)
    person_id = Column(Integer, ForeignKey("people.id"))
    helper_id = Column(Integer, ForeignKey("helpers.id"))
    # assigned / on_my_way / reached / need_backup / replaced
    status = Column(String, default="assigned")
    updated_at = Column(DateTime, default=now)


class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    capacity = Column(Integer, default=50)
    occupancy = Column(Integer, default=0)
    accessible = Column(Boolean, default=True)
    separate_sanitation = Column(Boolean, default=True)


class ReassignmentLog(Base):
    __tablename__ = "reassignment_log"
    id = Column(Integer, primary_key=True)
    person_id = Column(Integer, ForeignKey("people.id"))
    from_helper_id = Column(Integer, nullable=True)
    to_helper_id = Column(Integer, nullable=True)
    reason = Column(String)
    created_at = Column(DateTime, default=now)


class WarningLog(Base):
    __tablename__ = "warning_log"
    id = Column(Integer, primary_key=True)
    target_type = Column(String)  # person / helper
    target_id = Column(Integer)
    channel = Column(String)  # voice / sms
    message = Column(String)
    created_at = Column(DateTime, default=now)


class Event(Base):
    """A disaster event for one ward. Health details are visible only while active."""
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    ward = Column(String, index=True, nullable=False)
    name = Column(String, default="")
    status = Column(String, default="active")  # active / closed
    started_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    started_at = Column(DateTime, default=now)
    ended_at = Column(DateTime, nullable=True)


class ConsentRecord(Base):
    __tablename__ = "consent_records"
    id = Column(Integer, primary_key=True)
    person_id = Column(Integer, ForeignKey("people.id"))
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    method = Column(String, default="in_person")
    language = Column(String, default="en")
    scope = Column(String)
    created_at = Column(DateTime, default=now)
    revoked_at = Column(DateTime, nullable=True)


class AccessLog(Base):
    __tablename__ = "access_log"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    person_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=now)


class Concern(Base):
    """Confidential concern reporting (e.g. safety issue at a shelter)."""
    __tablename__ = "concerns"
    id = Column(Integer, primary_key=True)
    ward = Column(String)
    person_id = Column(Integer, nullable=True)
    message = Column(String, nullable=False)
    reported_by = Column(Integer, nullable=True)  # None when anonymous
    status = Column(String, default="open")  # open / resolved
    created_at = Column(DateTime, default=now)
