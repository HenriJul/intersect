/**
 * Subpage 6: Case Timeline
 */

import { computeComparisonMetrics } from "./comparisonView.js?v=9";
import {
  renderDelayThresholdControl,
  renderFocusStepBanner,
  renderPageTitleBlock
} from "./pageGuides.js?v=9";

export const TIMELINE_MODES = ["delayed", "healthy", "both"];

function renderSwimlaneSvg(caseObj, variant, selectedEventKey) {
  const laneHeight = 46;
  const padT = 32;
  const padB = 18;
  const labelW = 165;
  const plotL = 178;
  const plotR = 845;
  const plotW = plotR - plotL;
  const totalH = padT + caseObj.lanes.length * laneHeight + padB;

  const syncX1 = plotL + (caseObj.syncStartPct / 100) * plotW;
  const syncX2 = plotL + (caseObj.syncEndPct / 100) * plotW;
  const queueX2 = plotL + (caseObj.queueEndPct / 100) * plotW;
  const isDelayed = variant === "delayed";

  const lanesSvg = caseObj.lanes
    .map((lane, lIdx) => {
      const cy = padT + lIdx * laneHeight + laneHeight / 2;
      const evs = lane.events;
      const minX = plotL + (evs[0].x / 100) * plotW;
      const maxX = plotL + (evs[evs.length - 1].x / 100) * plotW;

      const dots = evs
        .map((ev, eIdx) => {
          const cx = plotL + (ev.x / 100) * plotW;
          const evKey = `${variant}-${lIdx}-${eIdx}`;
          const isSelected = selectedEventKey === evKey;
          const prevX = eIdx > 0 ? plotL + (evs[eIdx - 1].x / 100) * plotW : -999;
          const labelY = cx - prevX < 62 && eIdx % 2 === 1 ? cy + 16 : cy - 10;

          return `
            <g style="cursor:pointer;"
               tabindex="0"
               role="button"
               aria-label="${lane.objectLabel} — ${ev.label} (${ev.time} · ${ev.actor})"
               data-action="select-timeline-event"
               data-ev-key="${evKey}"
               data-ev-variant="${variant}"
               data-ev-label="${lane.objectLabel} — ${ev.label}"
               data-ev-meta="${ev.time} · ${ev.actor}">
              ${isSelected ? `<circle cx="${cx}" cy="${cy}" r="9.5" fill="none" stroke="var(--text-primary)" stroke-width="1.6" />` : ""}
              <circle cx="${cx}" cy="${cy}" r="5" fill="${lane.color}" stroke="var(--bg-card)" stroke-width="1.8" />
              <text x="${cx}" y="${labelY}" text-anchor="middle" font-size="9.5" font-weight="500" fill="var(--text-secondary)">${ev.label}</text>
            </g>
          `;
        })
        .join("");

      return `
        <g>
          <text x="10" y="${cy - 2}" font-size="11.5" font-weight="600" fill="var(--text-primary)">${lane.objectLabel}</text>
          <text x="10" y="${cy + 12}" font-size="10" fill="${lane.color}">${lane.subLabel}</text>
          <line x1="${plotL}" y1="${cy}" x2="${plotR}" y2="${cy}" stroke="var(--svg-lane-line)" stroke-width="1.2" />
          ${evs.length > 1 ? `<line x1="${minX}" y1="${cy}" x2="${maxX}" y2="${cy}" stroke="${lane.color}" stroke-width="2" stroke-opacity="0.4" />` : ""}
          ${dots}
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 865 ${totalH}" style="width:100%; min-width:700px; height:auto; display:block;">
      <rect x="${syncX1}" y="${padT - 8}" width="${Math.max(8, syncX2 - syncX1)}" height="${totalH - padT - padB + 12}"
            rx="6"
            fill="${isDelayed ? "var(--red-bg)" : "var(--green-bg)"}"
            stroke="${isDelayed ? "var(--red)" : "var(--green)"}"
            stroke-opacity="0.45"
            stroke-dasharray="4 3" />
      <text x="${(syncX1 + syncX2) / 2}" y="18" text-anchor="middle" font-size="10" font-weight="600"
            fill="${isDelayed ? "var(--red)" : "var(--green)"}">
        ${isDelayed ? "Waiting for Missing Objects (OPerA Sync)" : "Fast Object Alignment (OPerA Sync)"}
      </text>

      <rect x="${syncX2}" y="${padT - 8}" width="${Math.max(6, queueX2 - syncX2)}" height="${totalH - padT - padB + 12}"
            rx="6" fill="var(--purple-bg)" stroke="var(--purple)" stroke-opacity="0.35" stroke-dasharray="3 3" />

      <line x1="${labelW}" y1="${padT - 8}" x2="${labelW}" y2="${totalH - padB}" stroke="var(--svg-grid-line)" />
      ${lanesSvg}
    </svg>
  `;
}

function renderCaseCard(caseObj, variant, state) {
  const slaDays =
    state && typeof state.slaThresholdDays === "number" ? state.slaThresholdDays : 3.0;
  const gateWait =
    typeof caseObj.gateWaitDays === "number"
      ? caseObj.gateWaitDays
      : parseFloat(caseObj.duration) || 0;
  const exceedsSla = gateWait > slaDays;
  const slaComparisonText = `${gateWait.toFixed(1)}d gate wait ${exceedsSla ? "&gt;" : "&le;"} ${slaDays.toFixed(1)}d threshold`;
  const endToEndLabel = caseObj.endToEndDuration || caseObj.duration;

  const activeEv =
    state.selectedEventInfo &&
    state.selectedEventKey &&
    state.selectedEventKey.startsWith(`${variant}-`)
      ? state.selectedEventInfo
      : null;

  return `
    <div class="card sub-animate" style="margin-bottom:16px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; flex-wrap:wrap;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="badge ${exceedsSla ? "badge-red" : "badge-green"}">
              ${exceedsSla ? "Delayed" : "On-Time"} (${slaComparisonText}) · ${endToEndLabel}
            </span>
            <strong style="font-size:15px;">${caseObj.caseId}</strong>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">${caseObj.meta}</div>
        </div>

        <span class="badge badge-neutral">${caseObj.waitSummary}</span>
      </div>

      <div class="timeline-inline-inspector ${activeEv ? "is-active" : ""}">
        ${
          activeEv
            ? `<span><strong>Selected Event:</strong> ${activeEv.label}</span><span style="font-weight:600; color:var(--text-primary);">${activeEv.meta}</span>`
            : `<span>Click (or press Enter on) any event dot below to inspect its exact timestamp and responsible actor right here</span>`
        }
      </div>

      <div class="diagram-frame">
        ${renderSwimlaneSvg(caseObj, variant, state.selectedEventKey)}
      </div>
    </div>
  `;
}

export function renderTimelineCardsRegion(log, state) {
  const tl = log.timeline;
  const mode = state.timelineMode || "delayed";
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const m = computeComparisonMetrics(log, state);
  const slaDays =
    state && typeof state.slaThresholdDays === "number" ? state.slaThresholdDays : 3.0;

  return `
    ${mode === "delayed" || mode === "both" ? renderCaseCard(tl.delayedCase, "delayed", state) : ""}
    ${mode === "healthy" || mode === "both" ? renderCaseCard(tl.healthyCase, "healthy", state) : ""}

    <div class="card decision-closing-card sub-animate">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap;">
        <div style="flex:1; min-width:260px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge badge-green">Recommended Decision — ${step.name}</span>
            <span style="font-size:11.5px; color:var(--text-muted);">At -${state.whatIfReductionPct}% ${step.mainDelaySource}</span>
          </div>
          <div style="font-size:14.5px; font-weight:700; color:var(--text-primary); line-height:1.4;">
            ${step.recommendation || ""}
          </div>
          <div style="font-size:12.5px; color:var(--text-secondary); margin-top:6px;">
            Expected empirical impact across ${log.filename}: <strong>${m.recoveredCases} cases</strong> back &le; ${slaDays.toFixed(1)}d threshold · <strong>${m.unblockedEur}</strong> unblocked faster · <strong>${m.fewerRipples} ${log.comparison.rippleUnit}</strong>.
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
          <button class="btn" data-action="goto-page" data-page="compare">
            ← Adjust What-If Simulator
          </button>
          <button class="btn btn-dark" data-action="goto-page" data-page="overview">
            Back to Overview
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderTimelineView(log, state) {
  const mode = state.timelineMode || "delayed";
  const modeIdx = Math.max(0, TIMELINE_MODES.indexOf(mode));

  return `
    <div class="page-header">
      ${renderPageTitleBlock("Case Timeline", `Verified object lifecycles &amp; timestamps from ${log.filename}`)}

      <div class="header-controls">
        ${renderDelayThresholdControl(state)}
        <div class="segmented" role="group" aria-label="Select Example Case">
          <div id="timeline-seg-glider" class="seg-glider" style="transform: translateX(${modeIdx * 100}%);"></div>
          <button class="seg-option ${mode === "delayed" ? "active" : ""}" data-action="set-timeline-mode" data-mode="delayed">
            Delayed Example
          </button>
          <button class="seg-option ${mode === "healthy" ? "active" : ""}" data-action="set-timeline-mode" data-mode="healthy">
            On-Time Example
          </button>
          <button class="seg-option ${mode === "both" ? "active" : ""}" data-action="set-timeline-mode" data-mode="both">
            Show Both
          </button>
        </div>
      </div>
    </div>

    ${renderFocusStepBanner(log, state, { contextNote: "Real OCEL 2.0 object IDs & timestamps" })}

    <div id="timeline-cards-region">
      ${renderTimelineCardsRegion(log, state)}
    </div>
  `;
}
