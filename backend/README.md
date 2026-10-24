# Saathi-Evac Backend (Step 2: login, roles, privacy)

Proposed design, prototype stage. All demo data is fake. Voice/SMS are simulated (printed in terminal).

## Setup (first time) - same as Step 1
1. Python 3.10+ from python.org (tick "Add to PATH"). Open a terminal in this `backend` folder.
2. `python -m venv venv` then activate: Windows `venv\Scripts\activate` | Mac/Linux `source venv/bin/activate`
3. `pip install -r requirements.txt` (no new libraries in Step 2)

## Upgrading from Step 1
Delete the old `saathi.db` file (tables changed). `python seed.py` rebuilds it.

## Set a secret key (do this before real use)
Windows CMD: `set SECRET_KEY=any-long-random-text`
PowerShell: `$env:SECRET_KEY="any-long-random-text"`
Mac/Linux: `export SECRET_KEY=any-long-random-text`

## Run
1. `python seed.py` (fake data + demo logins)
2. `uvicorn app.main:app --reload`
3. Open http://127.0.0.1:8000/docs
4. Log in: `POST /auth/login` -> copy `access_token` -> click **Authorize** (top right) -> paste token -> Authorize.

Demo logins: `coord / Coord@12345`, `rescue / Rescue@12345`, `volunteer1 / Volunteer@12345`

## Test
`pytest`

## Who can do what
| Action | volunteer | coordinator | rescue |
|---|---|---|---|
| Register person, report concern | yes | yes | no |
| See people | own + assigned | all | all |
| See health details | assigned, during event | during event | during event |
| Trigger alert, start/end event, users, sweep, audit | no | yes | no |
| Queue, reassignment log, helpers list | no | yes | yes |
| Update own assignment, heartbeat | yes (own) | yes | no |
| Read concerns, access log | no | yes | no |
| `GET /rules` | public | public | public |

## Privacy built in
- Consent is required and recorded; `POST /people/{id}/consent/revoke` erases the person's data.
- Phone numbers are never returned by the API.
- Health score and reasons are hidden unless an event is active for the ward and you are allowed.
- Every health view is logged (`GET /audit/access`).
- Concerns can be anonymous (reporter is not stored).

## Demo order (judges' story)
1. Login as coord. `GET /dispatch/queue` -> health hidden (no event).
2. `POST /alerts {"ward":"ward-7"}` -> event starts, people warned.
3. `GET /dispatch/queue` -> scores and reasons now visible.
4. `POST /helpers/1/missed-checkin` -> `GET /dispatch/reassignments`.
5. `POST /helpers/sweep?minutes=0` -> silent helpers auto re-assigned.
6. `GET /dispatch/audit`, `GET /audit/access`, `GET /rules`.
7. Login as volunteer1 -> `GET /dispatch/queue` returns 403.
