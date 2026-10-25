import json, os, sys, urllib.error, urllib.request

key = os.environ.get("ADAPTION_API_KEY")
if not key or len(sys.argv) < 2:
    sys.exit("Set ADAPTION_API_KEY, then run: python download_adaption.py <dataset_id>")
BASE = "https://api.prod.adaptionlabs.ai"


def get(url, auth=True):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"} if auth else {})
    try:
        with urllib.request.urlopen(req) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}")


def as_json(b):
    try:
        return json.loads(b)
    except ValueError:
        return None


body = get(f"{BASE}/api/v1/datasets/{sys.argv[1]}/download")
data = as_json(body)
if isinstance(data, dict):  # some APIs return a temporary download link
    link = data.get("url") or data.get("download_url") or data.get("downloadUrl")
    if link:
        body = get(link, auth=False)
        data = as_json(body)
ext = "json" if data is not None else "csv"
with open(f"adaption_output.{ext}", "wb") as f:
    f.write(body)
print("Saved adaption_output." + ext)
print(body[:800].decode("utf-8", "replace"))