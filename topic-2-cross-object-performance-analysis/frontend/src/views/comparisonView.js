/**
 * Subpage 5: Compare Cases
 */

import { renderPageTitleBlock } from "./pageGuides.js";

function formatEur(num) {
  if (num >= 1000000) return `€${(num / 1000000).toFixed(2)}M`;
  return `€${Math.round(num).toLocaleString("en-US")}`;
}

export function computeComparisonMetrics(log, state) {
  const comp = log.comparison;
  const ratio = Math.pow(3.0 / Math.max(1.0, state.slaThresholdDays), 0.78);
  const delayedCount = Math.min(
    comp.totalClusters - 40,
    Math.max(45, Math.round(comp.baseDelayedAt3d * ratio))
  );
  const onTimeCount = comp.totalClusters - delayedCount;
  const delayedPct = Math.round((delayedCount / comp.totalClusters) * 100);
  const stalledEur = comp.baseStalledEur * (delayedCount / comp.baseDelayedAt3d);

  const redFactor = state.whatIfReductionPct / 100;
  const recoveredCases = Math.round(delayedCount * redFactor * 0.76);
  const unblockedEur = stalledEur * redFactor * 0.81;
  const fewerRipples = Math.round(comp.baseRippleEvents * redFactor * 0.68);

  return {
    onTimeCount: onTimeCount.toLocaleString("en-US"),
    onTimePct: `${100 - delayedPct}% of total`,
    delayedCount: delayedCount.toLocaleString("en-US"),
    delayedPct: `${delayedPct}% of total`,
    stalledEur: formatEur(stalledEur),
    recoveredCases: `+${recoveredCases}`,
    unblockedEur: formatEur(unblockedEur),
    fewerRipples: `-${fewerRipples}`
  };
}

export function renderComparisonView(log, state) {
  const comp = log.comparison;
  const m = computeComparisonMetrics(log, state);

  return `
    <div class="page-header">
      ${renderPageTitleBlock(
        "Compare Cases",
        `<span id="cmp-meta-text">On-time vs. delayed (&gt; ${state.slaThresholdDays.toFixed(1)} days wait)</span>`
      )}

      <div class="header-controls">
        <span style="font-size:13px; color:var(--text-muted); font-weight:500;">
          Delay Threshold: <strong id="cmp-sla-val" style="color:var(--text-primary);">${state.slaThresholdDays.toFixed(1)}d</strong>
        </span>
        <input
          type="range"
          class="range-slider"
          style="width:140px;"
          min="1.5"
          max="7.5"
          step="0.5"
          value="${state.slaThresholdDays}"
          data-action="change-sla"
          aria-label="Delay threshold in days"
        />
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">On-Time Cases</div>
        <div id="cmp-ontime-count" class="kpi-value" style="color:var(--green);">${m.onTimeCount}</div>
        <div id="cmp-ontime-pct" class="kpi-sub">${m.onTimePct}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Delayed Cases</div>
        <div id="cmp-delayed-count" class="kpi-value" style="color:var(--red);">${m.delayedCount}</div>
        <div id="cmp-delayed-pct" class="kpi-sub">${m.delayedPct}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Delayed Value</div>
        <div id="cmp-stalled-eur" class="kpi-value">${m.stalledEur}</div>
        <div class="kpi-sub">${comp.baseRippleEvents} ${comp.rippleUnit}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">
          <span>Top Delay Factors</span>
          <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Avg wait comparison</span>
        </div>

        ${comp.factors
          .map(
            (f) => `
            <div class="factor-row">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <span style="font-weight:600; font-size:14px;">${f.title}</span>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:11.5px; color:var(--text-muted);">${f.cases}</span>
                  <span class="badge badge-red">${f.multiplier}</span>
                </div>
              </div>

              <div class="compare-bar-grid">
                <span style="color:var(--red); font-weight:500;">With factor</span>
                <div class="progress-track">
                  <div class="progress-fill" style="width:${f.withPct}%; background:var(--red);"></div>
                </div>
                <strong style="text-align:right;">${f.withVal}</strong>
              </div>

              <div class="compare-bar-grid">
                <span style="color:var(--green); font-weight:500;">Without</span>
                <div class="progress-track">
                  <div class="progress-fill" style="width:${f.withoutPct}%; background:var(--green);"></div>
                </div>
                <span style="text-align:right; color:var(--text-secondary);">${f.withoutVal}</span>
              </div>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="card">
        <div class="card-title">
          <span>Estimate Improvement</span>
        </div>

        <div style="padding:14px 16px; background:var(--bg-subtle); border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:10px;">
            <span>Reduce ${comp.delayTargetLabel}</span>
            <span id="cmp-whatif-pct" style="color:var(--blue);">-${state.whatIfReductionPct}%</span>
          </div>
          <input
            type="range"
            class="range-slider"
            style="width:100%;"
            min="10"
            max="80"
            step="5"
            value="${state.whatIfReductionPct}"
            data-action="change-whatif"
            aria-label="Reduce delay percentage"
          />
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="chain-box">
            <span style="color:var(--text-secondary);">Cases Back On-Time</span>
            <strong id="cmp-recovered" style="font-size:17px; color:var(--green);">${m.recoveredCases}</strong>
          </div>
          <div class="chain-box">
            <span style="color:var(--text-secondary);">Value Unblocked Faster</span>
            <strong id="cmp-unblocked" style="font-size:17px;">${m.unblockedEur}</strong>
          </div>
          <div class="chain-box">
            <span style="color:var(--text-secondary);">Avoided ${comp.rippleUnit}</span>
            <strong id="cmp-ripples" style="font-size:17px; color:var(--blue);">${m.fewerRipples}</strong>
          </div>
        </div>

        <div style="margin-top:18px; display:flex; justify-content:flex-end;">
          <button class="btn" data-action="goto-page" data-page="timeline">
            View Case Timeline →
          </button>
        </div>
      </div>
    </div>
  `;
}
