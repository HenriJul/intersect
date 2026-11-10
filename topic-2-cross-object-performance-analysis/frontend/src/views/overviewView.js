/**
 * Subpage 1: Overview
 */

import {
  computeOverviewSlaMetrics,
  computeStepSlaStatus,
  renderDelayThresholdControl,
  renderPageTitleBlock
} from "./pageGuides.js?v=9";

export function renderOverviewBody(log, state) {
  const slaDays =
    state && typeof state.slaThresholdDays === "number"
      ? state.slaThresholdDays
      : log.defaultSlaDays;
  const sortBy = (state && state.overviewSortBy) || "impact";
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

  const orderedIds = log.topBottleneckIds.slice().sort((a, b) => {
    const sa = log.steps[a];
    const sb = log.steps[b];
    if (sortBy === "wait") {
      return (sb.waitDaysNum || 0) - (sa.waitDaysNum || 0);
    }
    return (sb.impactScore || 0) - (sa.impactScore || 0);
  });

  const bottleneckRows = orderedIds
    .map((id, idx) => {
      const s = log.steps[id];
      const slaInfo = computeStepSlaStatus(s, log, slaDays);
      const dotColor =
        slaInfo.severity === "red" ? "red" : slaInfo.severity === "amber" ? "amber" : "blue";

      return `
        <div class="bottleneck-row">
          <div class="bn-step-col">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="dot ${dotColor}" style="flex-shrink:0;"></span>
              <span style="font-size:15.5px; font-weight:700;">${idx + 1}. ${s.name}</span>
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:3px; padding-left:16px;">
              ${s.volume} · ${slaInfo.statusLabel}
            </div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Avg Wait (Median)</div>
            <div class="bn-stat-val">${s.avgWait}</div>
            <div style="font-size:11px; color:var(--text-muted);">Med ${s.medianWait || "—"} · IQR ${s.iqrWait || "—"}</div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Impact &amp; Score</div>
            <div class="bn-stat-val">${slaInfo.affectedValue}</div>
            <div style="font-size:11px; color:var(--text-muted);">Score ${s.impactScore}/100 · ${s.objectWaitDays || ""}</div>
          </div>

          <div class="bn-stat-col">
            <div class="bn-stat-label">Main Delay Source</div>
            <div class="bn-stat-val" style="font-weight:600;">${s.mainDelaySource}</div>
            <div style="font-size:11px; color:var(--text-muted);">n = ${(s.sampleN || 0).toLocaleString("en-US")} events · p_BH &lt; 0.001</div>
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

    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; flex-wrap:wrap;">
      <div style="font-size:13px; font-weight:600; color:var(--text-muted);">
        Top Bottlenecks — Ranked by ${
          sortBy === "wait"
            ? "Raw Average Wait Time"
            : "Composite Business Impact (Wait × Volume × Downstream Cascade)"
        }
      </div>
      <div style="display:inline-flex; align-items:center; gap:6px; font-size:12px;">
        <span style="color:var(--text-muted); font-weight:500;">Rank by:</span>
        <button type="button" class="btn btn-sm ${sortBy === "impact" ? "btn-dark" : ""}" style="padding:3px 9px; font-size:11.5px;" data-action="set-overview-sort" data-sort="impact">
          Impact Score
        </button>
        <button type="button" class="btn btn-sm ${sortBy === "wait" ? "btn-dark" : ""}" style="padding:3px 9px; font-size:11.5px;" data-action="set-overview-sort" data-sort="wait">
          Avg Wait Time
        </button>
      </div>
    </div>

    <div class="bottleneck-list">
      ${bottleneckRows}
    </div>
  `;
}

export function renderOverviewView(log, state) {
  return `
    <div class="page-header">
      ${renderPageTitleBlock("Overview", `${log.title} · ${log.timeSpan} · ${log.scenarioHeadline || ""}`)}
      <div class="header-controls">
        ${renderDelayThresholdControl(state)}
      </div>
    </div>

    <div id="overview-dynamic-region">
      ${renderOverviewBody(log, state)}
    </div>
  `;
}
