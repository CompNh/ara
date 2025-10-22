#!/usr/bin/env python3
import csv, sys, argparse, os
from collections import defaultdict

def read_csv(path):
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        return (r.fieldnames or []), list(r)

def write_csv(path, fieldnames, rows):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

def norm(s): return (s or "").strip()

def main():
    print("[update_tasks_csv] start", file=sys.stderr)
    p = argparse.ArgumentParser()
    p.add_argument("--csv", required=True, help="Path to Tasks.csv")
    p.add_argument("--wbs", default=None, help="Path to WBS.csv (default: repo root/WBS.csv)")
    p.add_argument("--complete", nargs="+", default=[], help="Task_ID list to mark as 완료")
    args = p.parse_args()

    tasks_path = args.csv
    wbs_path = args.wbs or os.path.join(os.path.dirname(tasks_path), "WBS.csv")
    print(f"[update_tasks_csv] tasks={tasks_path} wbs={wbs_path} ids={args.complete}", file=sys.stderr)

    if not os.path.exists(tasks_path):
        print(f"[update_tasks_csv] Tasks.csv not found: {tasks_path}", file=sys.stderr)
        return 1

    # --- Load Tasks.csv
    t_fields, t_rows = read_csv(tasks_path)
    required_t = {"Task_ID", "WBS_ID", "Status"}
    if not required_t.issubset(set(t_fields)):
        print("[update_tasks_csv] Tasks.csv must have headers: Task_ID, WBS_ID, Status", file=sys.stderr)
        return 1

    # index by Task_ID
    idx = {r["Task_ID"]: r for r in t_rows}
    changed_tasks = 0
    affected_wbs = set()

    # 1) Task 완료 처리
    for tid in args.complete:
        row = idx.get(tid)
        if row:
            if norm(row.get("Status")) != "완료":
                row["Status"] = "완료"
                changed_tasks += 1
                print(f"[update_tasks_csv] set 완료: {tid}", file=sys.stderr)
            if row.get("WBS_ID"):
                affected_wbs.add(row["WBS_ID"])
        else:
            print(f"[update_tasks_csv] Task_ID not found: {tid}", file=sys.stderr)

    if changed_tasks:
        write_csv(tasks_path, t_fields, t_rows)
        print(f"[update_tasks_csv] Tasks.csv updated {changed_tasks} row(s).", file=sys.stderr)
    else:
        print("[update_tasks_csv] Tasks.csv no changes needed.", file=sys.stderr)

    # --- Build grouping (전체 WBS 진행률 계산에 사용)
    grouped = defaultdict(list)
    for r in t_rows:
        wid = r.get("WBS_ID")
        if wid:
            grouped[wid].append(r)

    # --- Roll-up & Progress to WBS.csv
    if not os.path.exists(wbs_path):
        print(f"[update_tasks_csv] WBS.csv not found (skip roll-up/progress): {wbs_path}", file=sys.stderr)
        return 0

    w_fields, w_rows = read_csv(wbs_path)
    # 필수 컬럼 확인/추가
    if "WBS_ID" not in w_fields or "Status" not in w_fields:
        print("[update_tasks_csv] WBS.csv must have 'WBS_ID' and 'Status' headers.", file=sys.stderr)
        return 1
    if "Tasks_Progress" not in w_fields:
        w_fields = list(w_fields) + ["Tasks_Progress"]  # 맨 끝에 추가

    w_index = {r["WBS_ID"]: r for r in w_rows}
    changed_status = 0
    changed_progress = 0

    # 진행률은 **모든 WBS 행**에 대해 갱신 (없으면 0/0)
    for w_row in w_rows:
        wid = w_row.get("WBS_ID")
        tasks_for_w = grouped.get(wid, [])
        total = len(tasks_for_w)
        done = sum(1 for tr in tasks_for_w if norm(tr.get("Status")) == "완료")
        progress_str = f"{done}/{total}"

        # 2) 진행률 문자열 갱신   
        if w_row.get("Tasks_Progress") != progress_str:
            w_row["Tasks_Progress"] = progress_str
            changed_progress += 1
            print(f"[update_tasks_csv] progress {wid}: {progress_str}", file=sys.stderr)

        # 3) 상태 롤업 (해당 WBS에 task가 하나 이상 있고 모두 완료면 완료)
        if total > 0:
            all_done = (done == total)
            if all_done and norm(w_row.get("Status")) != "완료":
                w_row["Status"] = "완료"
                changed_status += 1
                print(f"[update_tasks_csv] WBS roll-up 완료: {wid}", file=sys.stderr)

    if changed_status or changed_progress:
        write_csv(wbs_path, w_fields, w_rows)
        print(f"[update_tasks_csv] WBS.csv updated: status={changed_status}, progress={changed_progress}", file=sys.stderr)
    else:
        print("[update_tasks_csv] WBS.csv no changes needed.", file=sys.stderr)

    return 0

if __name__ == "__main__":
    sys.exit(main())
