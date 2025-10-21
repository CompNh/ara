# ADR-0001: Assistant Sync Pipeline 채택

> **TL;DR (EN)**  
> Adopt an Assistant Sync Pipeline with auto-generated `STATE.md`.  
> Keep the Sync Pack in repo; use PR/Issue templates; do not commit ad-hoc Sync Packets by default.

## 상태
Accepted

## 배경
새 채팅으로 이어져도 맥락 손실 없이 즉시 상황을 파악해야 합니다. 이를 위해 GitHub Actions로 `STATE.md`를 자동 생성하고, PR/이슈 템플릿으로 계획(WBS/Tasks)과 코드를 일관되게 연결하려 합니다.

## 결정
- 레포에 **Assistant Sync Pack**(워크플로/스크립트/템플릿) 상시 보관
- 푸시/스케줄 시 **`STATE.md` 자동 생성·갱신**
- README 상단에 `STATE.md`/`ROADMAP.md` 링크 고정
- WBS/Task ID는 **PR/이슈 본문에만** 기록(커밋 메시지 강제 X)
- 세션 시작 시 **Sync Packet 텍스트**를 채팅/노션에 공유(기본적으로 Git 커밋하지 않음)

## 결과(영향)
**장점**
- 세션 간 맥락 복구 속도↑
- 계획↔코드 추적성↑
- 온보딩/일일 싱크 비용↓
  
**단점/리스크**
- `WBS.csv`/`Tasks.csv` 스냅샷을 가끔 갱신해야 함
- `STATE.md` 자동 커밋으로 레포 변경 이력 증가

## 대안 검토
- 노션만 단일 출처로 사용(코드 추적성 약함)  
- 수동 주간 요약(늦고 누락 위험)

## 링크
- `STATE.md`
- `ROADMAP.md`
- `.github/workflows/state.yml`
