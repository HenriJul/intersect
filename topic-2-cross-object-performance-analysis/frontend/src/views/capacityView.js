/**
 * Subpage 4: Team Workload
 */

import { renderPageTitleBlock } from "./pageGuides.js";

function renderTimelineChartSvg(timeline) {
  const width = 620;
  const height = 245;
  const padL = 42;
  const padR = 24;
  const padT = 26;
  const padB = 36;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxBacklog = Math.max(...timeline.map((d) => d.backlog), 100) * 1.15;
  const stepX = plotW / timeline.length;

  const bars = timeline
    .map((d, i) => {
      const cx = padL + stepX * i + stepX / 2;
      const barW = Math.min(34, stepX * 0.48);
      const loadH = (d.load / 100) * plotH;
      const barY = padT + (plotH - loadH);
      return `
        <g>
          <rect x="${cx - barW / 2}" y="${barY}" width="${barW}" height="${loadH}" rx="4"
                fill="${d.peak ? "var(--svg-bar-peak)" : "var(--svg-bar-fill)"}" />
          <text x="${cx}" y="${height - 12}" text-anchor="middle" font-size="10.5"
                font-weight="${d.peak ? "700" : "500"}" fill="${d.peak ? "var(--text-primary)" : "var(--text-muted)"}">${d.period}</text>
        </g>
      `;
    })
    .join("");

  const pts = timeline.map((d, i) => ({
    cx: padL + stepX * i + stepX / 2,
    cy: padT + plotH - (d.backlog / maxBacklog) * plotH,
    ...d
  }));

  const linePath = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.cx} ${p.cy}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].cx} ${padT + plotH} L ${pts[0].cx} ${padT + plotH} Z`;

  const dots = pts
    .map(
      (p) => `
      <g>
        <text x="${p.cx}" y="${p.cy - 9}" text-anchor="middle" font-size="10"
              font-weight="${p.peak ? "700" : "500"}" fill="${p.peak ? "var(--red)" : "var(--text-secondary)"}">${p.backlog}</text>
        <circle cx="${p.cx}" cy="${p.cy}" r="${p.peak ? 5.5 : 4}" fill="${p.peak ? "var(--red)" : "var(--text-primary)"}" stroke="var(--bg-card)" stroke-width="1.8" />
      </g>
    `
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; display:block;">
      <defs>
        <linearGradient id="bgArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dc2626" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#dc2626" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      <line x1="${padL}" y1="${padT}" x2="${width - padR}" y2="${padT}" stroke="var(--svg-lane-line)" />
      <line x1="${padL}" y1="${padT + plotH / 2}" x2="${width - padR}" y2="${padT + plotH / 2}" stroke="var(--svg-lane-line)" />
      <line x1="${padL}" y1="${padT + plotH}" x2="${width - padR}" y2="${padT + plotH}" stroke="var(--svg-grid-line)" />
      <text x="8" y="${padT + 6}" font-size="9.5" fill="var(--text-faint)">100%</text>
      <text x="8" y="${padT + plotH / 2 + 4}" font-size="9.5" fill="var(--text-faint)">50%</text>
      <text x="8" y="${padT + plotH}" font-size="9.5" fill="var(--text-faint)">0%</text>
      ${bars}
      <path d="${areaPath}" fill="url(#bgArea)" />
      <path d="${linePath}" fill="none" stroke="var(--red)" stroke-width="2.2" />
      ${dots}
    </svg>
  `;
}

export function renderTeamChartCard(activeTeam) {
  return `
    <div class="card sub-animate">
      <div class="card-title">
        <span>${activeTeam.name} — Load & Waiting Cases</span>
        <span style="font-size:12px; font-weight:500; color:var(--text-muted);">Bars: Load % · Line: Waiting Cases</span>
      </div>

      <div class="diagram-frame">
        ${renderTimelineChartSvg(activeTeam.timeline)}
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:16px; padding-top:14px; border-top:1px solid var(--border-soft); flex-wrap:wrap;">
        <span class="badge badge-red">${activeTeam.peakSummary}</span>
        <button class="btn btn-sm" data-action="goto-page" data-page="timeline">
          View Case Timeline →
        </button>
      </div>
    </div>
  `;
}

export function renderCapacityView(log, state) {
  const cap = log.capacity;
  const activeTeam = cap.teams.find((t) => t.id === state.selectedTeamId) || cap.teams[0];

  return `
    <div class="page-header">
      ${renderPageTitleBlock("Team Workload", "Shared teams across multiple object workflows")}
    </div>

    <div class="split-sidebar-grid">
      <div class="team-list">
        ${cap.teams
          .map((t) => {
            const isSelected = t.id === activeTeam.id;
            return `
              <button class="team-item ${isSelected ? "active" : ""}" data-action="select-team" data-team-id="${t.id}">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                  <span style="font-weight:700; font-size:14.5px;">${t.name}</span>
                  <span class="badge ${t.badgeClass}">${t.peakLoad}</span>
                </div>

                <div style="font-size:12px; color:var(--text-muted); margin:3px 0 10px;">
                  ${t.members} · ${t.avgQueue}
                </div>

                <div class="stacked-bar" style="height:10px;">
                  ${t.splits
                    .map((s) => `<div style="width:${s.pct}%; background:${s.color}; height:100%;"></div>`)
                    .join("")}
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; font-size:11.5px; color:var(--text-secondary);">
                  ${t.splits
                    .map(
                      (s) => `
                      <span style="display:inline-flex; align-items:center; gap:5px;">
                        <span class="dot" style="background:${s.color}; width:7px; height:7px;"></span>
                        ${s.label} (${s.pct}%)
                      </span>
                    `
                    )
                    .join("")}
                </div>
              </button>
            `;
          })
          .join("")}
      </div>

      <div id="team-chart-region">
        ${renderTeamChartCard(activeTeam)}
      </div>
    </div>
  `;
}
