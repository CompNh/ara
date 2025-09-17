// 목적: JSONC 기반 A11y waiver를 로드하고 axe 결과에서 예외 항목을 걸러낸다.
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'jsonc-parser';
import type { Result as AxeResult, NodeResult } from 'axe-core';

export type A11yWaiver = {
  ruleId: string;
  selectors?: string[];
  paths?: string[]; // window.location.pathname 기준
  reason?: string;
};
export type A11yWaivers = { waivers: A11yWaiver[] };

export function loadWaivers(cwd = process.cwd()): A11yWaivers {
  const file = path.join(cwd, 'e2e', 'a11y.waivers.jsonc');
  if (!fs.existsSync(file)) return { waivers: [] };
  const raw = fs.readFileSync(file, 'utf8');
  const data = parse(raw) as A11yWaivers | undefined;
  return data && Array.isArray(data.waivers) ? data : { waivers: [] };
}

// 주어진 violations에서 waiver에 해당하는 노드를 제거
export function filterByWaivers(
  violations: AxeResult[],
  waivers: A11yWaiver[],
  pathname: string,
): AxeResult[] {
  if (!waivers.length) return violations;

  return violations
    .map((v) => {
      const matched = waivers.filter((w) => w.ruleId === v.id && pathOk(w, pathname));
      if (!matched.length) return v;

      // 노드 단위로 셀렉터 매칭되는 것만 제거
      const remainingNodes = (v.nodes || []).filter((n) => !nodeWaived(n, matched));
      return { ...v, nodes: remainingNodes };
    })
    .filter((v) => (v.nodes?.length ?? 0) > 0);
}

function pathOk(w: A11yWaiver, pathname: string): boolean {
  if (!w.paths || !w.paths.length) return true;
  return w.paths.includes(pathname);
}

function nodeWaived(n: NodeResult, ws: A11yWaiver[]): boolean {
  const target = n.target?.join(' ') ?? '';
  return ws.some((w) =>
    (w.selectors || []).some((sel) => {
      try {
        // 간단 매칭: 문자열 포함(정규식이 필요하면 강화 가능)
        return target.includes(sel);
      } catch {
        return false;
      }
    }),
  );
}
