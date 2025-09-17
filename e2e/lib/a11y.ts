// 목적: AxeBuilder 실행 + HTML 리포트 + waiver 필터 적용
import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { AxeResults, Result as AxeResult, NodeResult } from 'axe-core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadWaivers, filterByWaivers } from './waivers';

export type A11yOptions = {
  tags?: string[];
  include?: string[];
  exclude?: string[];
  reportFile?: string;
  failOn?: Array<'critical' | 'serious' | 'moderate' | 'minor'>;
};

export async function runA11y(page: Page, options: A11yOptions = {}) {
  const {
    tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    include = [],
    exclude = [],
    reportFile = path.join(process.cwd(), 'e2e', 'a11y-report', 'home.html'),
    failOn = ['critical', 'serious'],
  } = options;

  let builder = new AxeBuilder({ page }).withTags(tags);
  include.forEach((sel) => (builder = builder.include(sel)));
  exclude.forEach((sel) => (builder = builder.exclude(sel)));

  const results: AxeResults = await builder.analyze();

  // ✅ Waiver 적용
  const { waivers } = loadWaivers();
  const pathname = new URL(await page.url()).pathname;
  const filteredViolations: AxeResult[] = filterByWaivers(
    results.violations || [],
    waivers,
    pathname,
  );

  // HTML 리포트 저장 (필터 후 결과로)
  const filtered: AxeResults = { ...results, violations: filteredViolations };
  const html = toHtmlReport(filtered);
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, html, 'utf8');

  type Impact = NonNullable<AxeResult['impact']>;
  const failed = filteredViolations.filter(
    (v) => (v.impact as Impact | undefined) && failOn.includes(v.impact as Impact),
  );

  return { results: filtered, violations: filteredViolations, failed, reportFile };
}

function toHtmlReport(results: AxeResults): string {
  const rows = (results.violations || [])
    .map((v: AxeResult) => {
      const nodes = (v.nodes || [])
        .map(
          (n: NodeResult) => `
      <li>
        <code>${escapeHtml((n.target || []).join(' '))}</code>
        <div>${escapeHtml(n.failureSummary || '')}</div>
      </li>`,
        )
        .join('');
      return `
      <tr>
        <td><strong>${escapeHtml(v.id)}</strong></td>
        <td>${escapeHtml(v.impact || '')}</td>
        <td>${escapeHtml(v.help || '')}</td>
        <td><a href="${escapeHtml(v.helpUrl || '')}" target="_blank" rel="noreferrer">docs</a></td>
        <td><ul>${nodes}</ul></td>
      </tr>`;
    })
    .join('');
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"/><title>A11y Report</title>
<style>body{font-family:system-ui,Arial;padding:16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}th{background:#f7f7f7}</style>
</head><body>
<h1>A11y Report</h1>
<p>Violations: <strong>${results.violations?.length || 0}</strong></p>
<table>
  <thead><tr><th>Rule</th><th>Impact</th><th>Help</th><th>Link</th><th>Nodes</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="5">No violations 🎉</td></tr>'}</tbody>
</table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]!,
  );
}
