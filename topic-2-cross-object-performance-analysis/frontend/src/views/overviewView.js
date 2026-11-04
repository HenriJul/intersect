/**
 * Subpage 1: Overview
 */

import { renderPageTitleBlock } from "./pageGuides.js";

export function renderOverviewView(log) {
  const kpiCards = log.overviewKpis
    .map(
      (k) => `
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>
    `
    )
    .join("");

  const bottleneckRows = log.topBottleneckIds
    .map((id) => {
      const s = log.steps[id];
      const dotColor = s.severity === "red" ? "red" : s.severity === "amber" ? "amber" : "blue";

      return `
        <div class="bottleneck-row">
          <div class="bn-step-col">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="dot ${dotColor}" style="flex-shrink:0;"></span>
              <span style="font-size:15.5px; font-weight:700;">${s.rank}. ${s.name}</span>
            </div>
            <div style="font-size:12.5px; color:var(--text-muted); margin-top:3px; padding-left:16px;">
              ${s.volume}
            </div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Avg Wait</div>
            <div class="bn-stat-val">${s.avgWait}</div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Impact</div>
            <div class="bn-stat-val">${s.affectedValue}</div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Main Delay Source</div>
            <div class="bn-stat-val" style="font-weight:600;">${s.mainDelaySource}</div>
          </div>

          <div class="bn-actions">
            <button class="btn btn-sm" data-action="jump-step-page" data-step-id="${s.id}" data-page="flow">
              View in Process Flow
            </button>
            <button class="btn btn-sm btn-dark" data-action="jump-step-page" data-step-id="${s.id}" data-page="delays">
              View Delay Breakdown
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="page-header">
      ${renderPageTitleBlock("Overview", `${log.title} · ${log.timeSpan}`)}
    </div>

    <div class="kpi-row">
      ${kpiCards}
    </div>

    <div style="font-size:13px; font-weight:600; color:var(--text-muted); margin-bottom:10px;">
      Top Bottlenecks
    </div>
    <div class="bottleneck-list">
      ${bottleneckRows}
    </div>
  `;
}
