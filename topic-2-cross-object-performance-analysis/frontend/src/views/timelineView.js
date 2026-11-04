/**
 * Subpage 6: Case Timeline
 */

import { renderPageTitleBlock } from "./pageGuides.js";

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
               data-action="select-timeline-event"
               data-ev-key="${evKey}"
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
        ${isDelayed ? "Waiting for Missing Objects" : "Object Alignment"}
      </text>

      <rect x="${syncX2}" y="${padT - 8}" width="${Math.max(6, queueX2 - syncX2)}" height="${totalH - padT - padB + 12}"
            rx="6" fill="var(--purple-bg)" stroke="var(--purple)" stroke-opacity="0.35" stroke-dasharray="3 3" />

      <line x1="${labelW}" y1="${padT - 8}" x2="${labelW}" y2="${totalH - padB}" stroke="var(--svg-grid-line)" />
      ${lanesSvg}
    </svg>
  `;
}

function renderCaseCard(caseObj, variant, state) {
  const isDelayed = variant === "delayed";

  return `
    <div class="card sub-animate" style="margin-bottom:16px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; flex-wrap:wrap;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge ${isDelayed ? "badge-red" : "badge-green"}">
              ${isDelayed ? "Delayed" : "On-Time"} · ${caseObj.duration}
            </span>
            <strong style="font-size:15px;">${caseObj.caseId}</strong>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">${caseObj.meta}</div>
        </div>

        <span class="badge badge-neutral">${caseObj.waitSummary}</span>
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
  const activeEv = state.selectedEventInfo;

  return `
    ${mode === "delayed" || mode === "both" ? renderCaseCard(tl.delayedCase, "delayed", state) : ""}
    ${mode === "healthy" || mode === "both" ? renderCaseCard(tl.healthyCase, "healthy", state) : ""}

    <div style="font-size:12.5px; color:var(--text-secondary); padding:10px 14px; background:var(--bg-subtle); border-radius:var(--radius-sm); border:1px solid var(--border-soft); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
      ${
        activeEv
          ? `<span><strong>${activeEv.label}</strong></span><span style="color:var(--text-muted);">${activeEv.meta}</span>`
          : `<span style="color:var(--text-muted);">Click any event dot on the timeline to view its timestamp and actor</span>`
      }
    </div>
  `;
}

export function renderTimelineView(log, state) {
  const mode = state.timelineMode || "delayed";
  const modeIdx = Math.max(0, TIMELINE_MODES.indexOf(mode));

  return `
    <div class="page-header">
      ${renderPageTitleBlock("Case Timeline", `Individual object timelines from ${log.filename}`)}

      <div class="header-controls">
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

    <div id="timeline-cards-region">
      ${renderTimelineCardsRegion(log, state)}
    </div>
  `;
}
