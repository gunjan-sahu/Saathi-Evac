from typing import Optional
from pydantic import BaseModel, Field


class PersonIn(BaseModel):
    name: str
    age: int = Field(ge=0, le=120)
    phone: str
    language: str = "en"
    ward: str
    lat: float
    lon: float
    consent: bool
    gender: Optional[str] = None  # audit only
    prefers_women_team: bool = False
    bedridden: bool = False
    mobility_aid: bool = False
    oxygen_dependent: bool = False
    dialysis: bool = False
    hearing_limit: bool = False
    vision_limit: bool = False
    infant_or_pregnancy: bool = False
    lives_alone: bool = False


class HelperIn(BaseModel):
    name: str
    phone: str
    lat: float
    lon: float
    capacity: int = Field(default=2, ge=1, le=10)
    skills: str = ""
    women_led: bool = False


class ShelterIn(BaseModel):
    name: str
    lat: float
    lon: float
    capacity: int = Field(default=50, ge=1)
    accessible: bool = True
    separate_sanitation: bool = True


class AlertIn(BaseModel):
    ward: str
    message: Optional[str] = None


class LoginIn(BaseModel):
    username: str
    password: str


class BootstrapIn(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=8)
    full_name: str = ""


class UserIn(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=8)
    full_name: str = ""
    role: str
    helper_id: Optional[int] = None


class EventIn(BaseModel):
    ward: str
    name: str = ""


class ConcernIn(BaseModel):
    ward: str
    message: str = Field(min_length=3)
    person_id: Optional[int] = None
    anonymous: bool = True
