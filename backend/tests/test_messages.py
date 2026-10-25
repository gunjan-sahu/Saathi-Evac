from app import messages


def test_ward_is_filled_in():
    t = messages.warning_text("en", "ward-7")
    assert "ward-7" in t and "{ward}" not in t and "Press 1" in t


def test_unknown_language_falls_back_to_english():
    assert messages.warning_text("xx", "w9") == messages.warning_text("en", "w9")


def test_languages_endpoint(client):
    codes = [l["code"] for l in client.get("/languages").json()]
    assert "en" in codes and "hi" in codes
