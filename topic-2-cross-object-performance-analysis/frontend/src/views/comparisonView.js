/**
 * Subpage 5: Compare Cases
 */

import { evaluateEmpiricalWhatIf } from "../data/empiricalCohortData.js?v=9";
import {
  renderDelayThresholdControl,
  renderFocusStepBanner,
  renderPageTitleBlock
} from "./pageGuides.js?v=9";

function formatEur(num) {
  if (num >= 1000000) return `€${(num / 1000000).toFixed(2)}M`;
  return `€${Math.round(num).toLocaleString("en-US")}`;
}

export function computeComparisonMetrics(log, state) {
  const comp = log.comparison;
  const baseSla = log.defaultSlaDays || 3.0;
  const slaDays =
    state && typeof state.slaThresholdDays === "number" ? state.slaThresholdDays : baseSla;
  const redPct =
    state && typeof state.whatIfReductionPct === "number" ? state.whatIfReductionPct : 40;

  const sim = evaluateEmpiricalWhatIf(
    log.logId,
    slaDays,
    redPct,
    comp.primaryFactorShare || 0.74,
    comp.baseStalledEur,
    baseSla,
    comp.baseRippleEvents
  );

  return {
    onTimeCount: sim.onTimeCount.toLocaleString("en-US"),
    onTimePct: `${sim.onTimePct}% of ${sim.totalCount.toLocaleString("en-US")} cases`,
    delayedCount: sim.delayedCount.toLocaleString("en-US"),
    delayedPct: `${sim.delayedPct}% of ${sim.totalCount.toLocaleString("en-US")} cases`,
    stalledEur: formatEur(sim.stalledEur),
    recoveredCases: `+${sim.recoveredCases.toLocaleString("en-US")}`,
    unblockedEur: formatEur(sim.unblockedEur),
    fewerRipples: `-${sim.fewerRipples.toLocaleString("en-US")}`,
    scaledRipplesStr: `${sim.scaledRipples.toLocaleString("en-US")} ${comp.rippleUnit}`
  };
}

export function renderComparisonView(log, state) {
  const comp = log.comparison;
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const m = computeComparisonMetrics(log, state);

  return `
    <div class="page-header">
      ${renderPageTitleBlock(
        "Compare Cases",
        `<span id="cmp-meta-text">Empirical cohorts: on-time vs. delayed (&gt; ${state.slaThresholdDays.toFixed(1)}d gate wait · n = ${comp.totalClusters.toLocaleString("en-US")})</span>`
      )}

      <div class="header-controls">
        ${renderDelayThresholdControl(state)}
      </div>
    </div>

    ${renderFocusStepBanner(log, state, { contextNote: comp.testNote || "" })}

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">On-Time Cohort (&le; ${state.slaThresholdDays.toFixed(1)}d)</div>
        <div id="cmp-ontime-count" class="kpi-value" style="color:var(--green);">${m.onTimeCount}</div>
        <div id="cmp-ontime-pct" class="kpi-sub">${m.onTimePct}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Delayed Cohort (&gt; ${state.slaThresholdDays.toFixed(1)}d)</div>
        <div id="cmp-delayed-count" class="kpi-value" style="color:var(--red);">${m.delayedCount}</div>
        <div id="cmp-delayed-pct" class="kpi-sub">${m.delayedPct}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Delayed Cohort Value</div>
        <div id="cmp-stalled-eur" class="kpi-value">${m.stalledEur}</div>
        <div id="cmp-ripple-sub" class="kpi-sub">${m.scaledRipplesStr}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">
          <div>
            <span>Statistically Significant Delay Factors</span>
            <div style="font-size:11px; color:var(--text-muted); font-weight:500; margin-top:2px;">
              ${comp.testNote || "Mann–Whitney U · 95% Bootstrap CI · Benjamini–Hochberg FDR"}
            </div>
          </div>
          <span class="badge badge-neutral">BH-Corrected</span>
        </div>

        ${comp.factors
          .map(
            (f) => `
            <div class="factor-row">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                <span style="font-weight:700; font-size:14px;">${f.title}</span>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
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

              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:7px; font-size:11px; color:var(--text-muted); flex-wrap:wrap;">
                <span>With: ${f.withCi || "—"} · Without: ${f.withoutCi || "—"}</span>
                <span style="font-weight:600; color:var(--text-secondary);">${f.cliffsDelta || ""} · ${f.pValBh || "p_BH < 0.001"}</span>
              </div>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="card">
        <div class="card-title">
          <div>
            <span>Scenario What-If Simulator — ${step.name}</span>
            <div style="font-size:11px; color:var(--text-muted); font-weight:500; margin-top:2px;">
              Evaluates how many of the ${m.delayedCount} delayed cases drop &le; ${state.slaThresholdDays.toFixed(1)}d
            </div>
          </div>
          <span class="badge badge-neutral">Empirical CDF</span>
        </div>

        <div style="padding:14px 16px; background:var(--bg-subtle); border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:10px;">
            <span>Reduce ${step.mainDelaySource}</span>
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
          <div style="font-size:11.5px; color:var(--text-muted); margin-top:8px;">
            Recommendation: ${step.recommendation || ""}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="chain-box">
            <span style="color:var(--text-secondary);">Cases Back On-Time (&le; <span id="cmp-target-sla">${state.slaThresholdDays.toFixed(1)}d</span>)</span>
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
          <button class="btn btn-dark" data-action="goto-page" data-page="timeline">
            Verify on Case Timeline →
          </button>
        </div>
      </div>
    </div>
  `;
}
