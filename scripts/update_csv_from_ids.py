#!/usr/bin/env python3
import csv, json, os, sys
from collections import defaultdict

# args: path to JSON ["T-123","T-456"]
ids_path = sys.argv[1] if len(sys.argv) > 1 else ".git/TASK_IDS.json"
task_ids = set(json.load(open(ids_path, encoding="utf-8")))
DONE_LABEL = os.environ.get("DONE_LABEL", "완료").strip()
DONE_SET = {DONE_LABEL.lower(), "done", "complete", "완료"}

def is_done(s): return (s or "").strip().lower() in DONE_SET

# --- Tasks.csv ---
tpath = "Tasks.csv"
with open(tpath, "r", encoding="utf-8-sig", newline="") as f:
    rdr = csv.DictReader(f)
    t_fields = rdr.fieldnames or []
    rows = list(rdr)

need = {"Task_ID","WBS_ID","Status"}
if not need.issubset(set(t_fields)):
    print(f"[ERR] Tasks.csv missing {need - set(t_fields)}"); sys.exit(1)

changed_t = False
for r in rows:
    if r.get("Task_ID") in task_ids and not is_done(r.get("Status")):
        r["Status"] = DONE_LABEL; changed_t = True

if changed_t:
    with open(tpath, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=t_fields); w.writeheader(); w.writerows(rows)
    print("[OK] Updated Tasks.csv")

# group by WBS_ID
by_wbs = defaultdict(list)
for r in rows: by_wbs[r.get("WBS_ID","")].append(r)

# --- WBS.csv ---
wpath = "WBS.csv"
if os.path.exists(wpath):
    with open(wpath, "r", encoding="utf-8-sig", newline="") as f:
        rdr = csv.DictReader(f)
        w_fields = rdr.fieldnames or []
        w_rows = list(rdr)
else:
    w_fields, w_rows = [], []

changed_w = False
if w_rows:
    if "Status" not in w_fields: w_fields += ["Status"]
    if "완료 Task 수" not in w_fields: w_fields += ["완료 Task 수"]

    for wr in w_rows:
        wid = wr.get("WBS_ID","")
        lst = by_wbs.get(wid, [])
        tot = len(lst); done = sum(1 for x in lst if is_done(x.get("Status")))
        ratio = f"{done}/{tot}"
        if wr.get("완료 Task 수","") != ratio:
            wr["완료 Task 수"] = ratio; changed_w = True
        if tot > 0 and done == tot and not is_done(wr.get("Status")):
            wr["Status"] = DONE_LABEL; changed_w = True

    if changed_w:
        with open(wpath, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=w_fields); w.writeheader(); w.writerows(w_rows)
        print("[OK] Updated WBS.csv")

print("[DONE] IDs:", ", ".join(sorted(task_ids)))
