"""Shelter agent: nearest shelter that fits the person's needs."""
from ..models import Shelter
from .matching import km


def match_shelter(db, person):
    needs_access = person.bedridden or person.mobility_aid
    options = []
    for s in db.query(Shelter).all():
        if s.occupancy >= s.capacity or (needs_access and not s.accessible):
            continue
        # prefer separate sanitation, then nearest
        options.append((not s.separate_sanitation, km(person.lat, person.lon, s.lat, s.lon), s))
    options.sort(key=lambda x: (x[0], x[1]))
    return options[0][2] if options else None
