"""Warning message library. Loads app/data/messages.json (made by import_adaption.py).
Falls back to built-in English and Hindi, so warnings always work."""
import json
import os
from functools import lru_cache

PATH = os.path.join(os.path.dirname(__file__), "data", "messages.json")
NAMES = {"en": "English", "hi": "हिन्दी", "bn": "বাংলা", "mr": "मराठी", "ta": "தமிழ்", "ur": "اردو",
         "te": "తెలుగు", "gu": "ગુજરાતી", "ml": "മലയാളം", "kn": "ಕನ್ನಡ", "or": "ଓଡ଼ିଆ", "as": "অসমীয়া", "pa": "ਪੰਜਾਬੀ"}
BUILTIN = {
    "en": {"flood_alert": "Alert for {ward}. Flood water is rising. Help is being arranged for you. Please stay where you are and keep your phone close.",
           "safety_check": "Are you safe? Press 1 if you are safe. Press 2 if you need help."},
    "hi": {"flood_alert": "{ward} के लिए चेतावनी। मदद की व्यवस्था की जा रही है।",
           "safety_check": "सुरक्षित हैं तो 1 दबाएँ, मदद चाहिए तो 2 दबाएँ।"},
}


@lru_cache(maxsize=1)
def _library():
    try:
        with open(PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def reload():
    _library.cache_clear()


def get_message(lang, scenario, ward=""):
    lib = _library()
    for source in (lib.get(lang, {}), BUILTIN.get(lang, {}), lib.get("en", {}), BUILTIN["en"]):
        text = source.get(scenario)
        if text:
            return text.replace("{ward}", ward)
    return ""


def warning_text(lang, ward):
    """What the voice call says: the flood alert, then the safe / need-help question."""
    return " ".join(filter(None, [get_message(lang, "flood_alert", ward), get_message(lang, "safety_check", ward)]))


def languages():
    lib = _library()
    codes = ["en", "hi"] + [c for c in lib if not c.startswith("_") and c not in ("en", "hi")]
    status = lib.get("_meta", {}).get("status", "")
    return [{"code": c, "name": NAMES.get(c, c),
             "review_status": status if (c in lib and c != "en") else "built-in"} for c in codes]
