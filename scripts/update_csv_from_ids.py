#!/usr/bin/env python3
import csv, json, os, re, subprocess
from collections import defaultdict

# --- IDs: prefer argv JSON path, else parse last commit message [T-XXXX/F] ---
def ids_from_last_commit():
    try:
        msg = subprocess.run(
            ["git", "log", "-1", "--pretty=%B"],
            capture_output=True, text=True, encoding="utf-8", errors="ignore"
        ).stdout
    except Exception:
        msg = ""
    # Accept [T-123/F] or [T-123/f]
    return sorted(set('T-' + m.group(1)
                      for m in re.finditer(r'\[T-([0-9A-Za-z\-]+)/[Ff]\]', msg)))

task_ids: set[str] = set()
if len(os.sys.argv) > 1 and os.path.exists(os.sys.argv[1]) and os.path.getsize(os.sys.argv[1]) > 0:
    task_ids = set(json.load(open(os.sys.argv[1], encoding="utf-8")))
else:
    task_ids = set(ids_from_last_commit())

if not task_ids:
    print("[OK] no IDs")
    raise SystemExit(0)

DONE_LABEL = os.environ.get("DONE_LABEL", "Done").strip()   # ASCII 기본(인코딩 안전)
DONE_SET = {DONE_LABEL.lower(), "done", "complete", "완료"}

def is_done(s: str) -> bool:
    return (s or "").strip().lower() in DONE_SET

# --- Tasks.csv ---
tpath = "Tasks.csv"
if not os.path.exists(tpath):
    print("[ERR] Tasks.csv not found"); raise SystemExit(1)

with open(tpath, "r", encoding="utf-8-sig", newline="") as f:
    rdr = csv.DictReader(f)
    t_fields = rdr.fieldnames or []
    t_rows = list(rdr)

need = {"Task_ID", "WBS_ID", "Status"}
if not need.issubset(set(t_fields)):
    print(f"[ERR] Tasks.csv missing {need - set(t_fields)}"); raise SystemExit(1)

changed_t = False
for r in t_rows:
    if r.get("Task_ID") in task_ids and not is_done(r.get("Status")):
        r["Status"] = DONE_LABEL
        changed_t = True

if changed_t:
    with open(tpath, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=t_fields)
        w.writeheader(); w.writerows(t_rows)
    print("[OK] Updated Tasks.csv")

# --- group by WBS_ID ---
by_wbs = defaultdict(list)
for r in t_rows:
    by_wbs[r.get("WBS_ID", "")].append(r)

# --- WBS.csv ---
wpath = "WBS.csv"
w_fields, w_rows = [], []
if os.path.exists(wpath):
    with open(wpath, "r", encoding="utf-8-sig", newline="") as f:
        rdr = csv.DictReader(f)
        w_fields = rdr.fieldnames or []
        w_rows = list(rdr)

changed_w = False
if w_rows:
    if "Status" not in w_fields: w_fields += ["Status"]
    if "완료 Task 수" not in w_fields: w_fields += ["완료 Task 수"]

    for wr in w_rows:
        wid = wr.get("WBS_ID", "")
        lst = by_wbs.get(wid, [])
        tot = len(lst)
        done = sum(1 for x in lst if is_done(x.get("Status")))
        ratio = f"{done}/{tot}"
        if wr.get("완료 Task 수", "") != ratio:
            wr["완료 Task 수"] = ratio
            changed_w = True
        if tot > 0 and done == tot and not is_done(wr.get("Status")):
            wr["Status"] = DONE_LABEL
            changed_w = True

    if changed_w:
        with open(wpath, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=w_fields)
            w.writeheader(); w.writerows(w_rows)
        print("[OK] Updated WBS.csv")

print("[DONE] IDs:", ", ".join(sorted(task_ids)))
