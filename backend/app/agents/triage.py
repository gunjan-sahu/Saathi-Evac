"""Triage agent: rule-based and explainable. Gender is NEVER used here."""

# field: (points, reason shown to coordinators)
WEIGHTS = {
    "bedridden": (30, "Bedridden"),
    "oxygen_dependent": (30, "Oxygen dependent"),
    "dialysis": (25, "Needs dialysis"),
    "mobility_aid": (15, "Uses mobility aid"),
    "infant_or_pregnancy": (15, "Infant or pregnancy"),
    "lives_alone": (10, "Lives alone"),
    "hearing_limit": (8, "Hearing limitation"),
    "vision_limit": (8, "Vision limitation"),
}
AGE_THRESHOLD, AGE_POINTS = 75, 10


def score_person(p):
    score, reasons = 0, []
    for field, (points, label) in WEIGHTS.items():
        if getattr(p, field):
            score += points
            reasons.append(f"{label} (+{points})")
    if p.age >= AGE_THRESHOLD:
        score += AGE_POINTS
        reasons.append(f"Age {AGE_THRESHOLD} or above (+{AGE_POINTS})")
    return score, reasons


def published_rules():
    """Public so officials and NGOs can audit the scoring."""
    return {
        "weights": {f: {"points": pts, "label": label} for f, (pts, label) in WEIGHTS.items()},
        "age_rule": {"min_age": AGE_THRESHOLD, "points": AGE_POINTS},
        "never_used_as_input": ["gender", "name", "caste", "religion"],
        "note": "Weights are a prototype default. Final weights to be set with NGO/NDMA guidance.",
    }
