/**
 * Subpage 1: Overview
 */

import {
  computeOverviewSlaMetrics,
  computeStepSlaStatus,
  renderDelayThresholdControl,
  renderEditExplanationsButton,
  renderPageTitleBlock
} from "./pageGuides.js?v=13";

export function renderOverviewBody(log, state) {
  const slaDays = state && typeof state.slaThresholdDays === "number" ? state.slaThresholdDays : log.defaultSlaDays;
  const ovSla = computeOverviewSlaMetrics(log, slaDays);

  const kpiCards = log.overviewKpis
    .map((k, idx) => {
      const val = idx === 2 ? ovSla.delayedValueStr : k.value;
      const sub = idx === 2 ? ovSla.delayedSubStr : k.sub;
      return `
        <div class="kpi-card">
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-value">${val}</div>
          <div class="kpi-sub">${sub}</div>
        </div>
      `;
    })
    .join("");

  const bottleneckRows = log.topBottleneckIds
    .map((id) => {
      const s = log.steps[id];
      const slaInfo = computeStepSlaStatus(s, log, slaDays);
      const dotColor =
        slaInfo.severity === "red" ? "red" : slaInfo.severity === "amber" ? "amber" : "blue";

      return `
        <div class="bottleneck-row">
          <div class="bn-step-col">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="dot ${dotColor}" style="flex-shrink:0;"></span>
              <span style="font-size:15.5px; font-weight:700;">${s.rank}. ${s.name}</span>
            </div>
            <div style="font-size:12.5px; color:var(--text-muted); margin-top:3px; padding-left:16px;">
              ${s.volume} · ${slaInfo.statusLabel}
            </div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Avg Wait</div>
            <div class="bn-stat-val">${s.avgWait}</div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Impact</div>
            <div class="bn-stat-val">${slaInfo.affectedValue}</div>
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

export function renderOverviewView(log, state) {
  return `
    <div class="page-header">
      ${renderPageTitleBlock("Overview", `${log.title} · ${log.timeSpan}`)}
      <div class="header-controls">
        ${renderDelayThresholdControl(state)}
        ${renderEditExplanationsButton()}
      </div>
    </div>

    <div id="overview-dynamic-region">
      ${renderOverviewBody(log, state)}
    </div>
  `;
}
