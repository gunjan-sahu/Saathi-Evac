"""Warning agent: voice first, SMS fallback. Providers are SIMULATED for now.
Replace send_voice / send_sms with Twilio or an Indian provider later."""
from ..models import Person, Assignment, Helper, WarningLog
from ..messages import warning_text


def send_voice(phone, text):
    print(f"[SIMULATED VOICE] {phone}: {text}")
    return True  # return False to test SMS fallback


def send_sms(phone, text):
    print(f"[SIMULATED SMS] {phone}: {text}")
    return True


def run_warning(db, ward, override=None):
    sent = 0
    people = db.query(Person).filter(Person.ward == ward, Person.consent == True).all()  # noqa: E712
    for p in people:
        text = override or warning_text(p.language, ward)
        channel = "voice" if send_voice(p.phone, text) else ("sms" if send_sms(p.phone, text) else "failed")
        db.add(WarningLog(target_type="person", target_id=p.id, channel=channel, message=text))
        helper_ids = {a.helper_id for a in db.query(Assignment).filter(Assignment.person_id == p.id)}
        for h in db.query(Helper).filter(Helper.id.in_(helper_ids)).all():
            htext = f"Please check on {p.name} (ward {ward})."
            send_sms(h.phone, htext)
            db.add(WarningLog(target_type="helper", target_id=h.id, channel="sms", message=htext))
        sent += 1
    db.commit()
    return sent
