/**
 * Subpage 3: Delay Breakdown
 */

import { renderPageTitleBlock } from "./pageGuides.js";

export function renderDelayBody(log, state) {
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const bd = step.breakdown;

  return `
    <div class="card sub-animate" style="margin-bottom:18px;">
      <div class="card-title">
        <span>Where Wait Time Goes (${bd.totalDays} days avg)</span>
        <span class="badge badge-neutral">${step.primaryCauseTag}</span>
      </div>

      <div class="delay-summary-callout">
        <div class="delay-summary-label">Why This Step Is Delayed</div>
        <p class="delay-summary-text">${step.summaryText}</p>
      </div>

      <div class="stacked-bar">
        ${
          bd.allItemsPct > 0
            ? `<div class="stacked-part" style="width:${bd.allItemsPct}%; background:#d97706;">${bd.allItemsPct >= 12 ? `${bd.allItemsPct}%` : ""}</div>`
            : ""
        }
        ${
          bd.otherObjectsPct > 0
            ? `<div class="stacked-part" style="width:${bd.otherObjectsPct}%; background:#2563eb;">${bd.otherObjectsPct >= 12 ? `${bd.otherObjectsPct}%` : ""}</div>`
            : ""
        }
        ${
          bd.teamPct > 0
            ? `<div class="stacked-part" style="width:${bd.teamPct}%; background:#7c3aed;">${bd.teamPct >= 12 ? `${bd.teamPct}%` : ""}</div>`
            : ""
        }
      </div>

      <div class="stat-columns-3">
        <div class="stat-col-item">
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted); font-weight:600;">
            <span class="dot amber"></span> Waiting for All Items
          </div>
          <div style="font-size:19px; font-weight:700; margin-top:4px;">
            ${bd.allItemsDays}d <span style="font-size:13px; font-weight:500; color:var(--text-muted);">(${bd.allItemsPct}%)</span>
          </div>
          <p class="delay-desc-text">${bd.allItemsDesc}</p>
        </div>

        <div class="stat-col-item">
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted); font-weight:600;">
            <span class="dot blue"></span> Waiting for Other Objects
          </div>
          <div style="font-size:19px; font-weight:700; margin-top:4px;">
            ${bd.otherObjectsDays}d <span style="font-size:13px; font-weight:500; color:var(--text-muted);">(${bd.otherObjectsPct}%)</span>
          </div>
          <p class="delay-desc-text">${bd.otherObjectsDesc}</p>
        </div>

        <div class="stat-col-item">
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted); font-weight:600;">
            <span class="dot" style="background:var(--purple);"></span> Waiting for Team
          </div>
          <div style="font-size:19px; font-weight:700; margin-top:4px;">
            ${bd.teamDays}d <span style="font-size:13px; font-weight:500; color:var(--text-muted);">(${bd.teamPct}%)</span>
          </div>
          <p class="delay-desc-text">${bd.teamDesc}</p>
        </div>
      </div>
    </div>

    <div class="two-col sub-animate">
      <div class="card">
        <div class="card-title">
          <span>Slowest Incoming Objects</span>
          <span style="font-size:12px; font-weight:500; color:var(--text-muted);">Share of delays</span>
        </div>

        ${step.delaySources
          .map(
            (src) => `
            <div class="progress-row">
              <div class="progress-top">
                <span style="font-weight:600;">${src.label}</span>
                <span><strong>${src.pct}%</strong> <span style="color:var(--text-muted);">(${src.lag})</span></span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${src.pct}%; background:${src.color};"></div>
              </div>
              <p class="delay-desc-text" style="margin-top:6px;">${src.desc}</p>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="card">
        <div class="card-title">
          <span>Upstream & Downstream Impact</span>
          <span style="font-size:12px; font-weight:500; color:var(--text-muted);">Cause & effect</span>
        </div>

        <div class="chain-vertical">
          ${step.chain
            .map(
              (c, idx) => `
              <div class="chain-box chain-box-detailed" style="${idx === 1 ? "background:var(--bg-subtle); border-color:var(--border-hover);" : ""}">
                <div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px; width:100%;">
                  <div>
                    <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">${c.stage}</div>
                    <div style="font-weight:700; font-size:14.5px;">${c.name}</div>
                  </div>
                  <div style="font-size:12.5px; font-weight:600; color:var(--text-secondary); white-space:nowrap;">${c.metric}</div>
                </div>
                <p class="delay-desc-text" style="margin-top:5px;">${c.desc}</p>
              </div>
              ${idx < step.chain.length - 1 ? `<div class="chain-arrow">↓</div>` : ""}
            `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

export function renderDelayView(log, state) {
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const allSteps = Object.values(log.steps);

  return `
    <div class="page-header">
      ${renderPageTitleBlock("Delay Breakdown", `<span id="delay-meta-text">${step.volume} · ${step.affectedValue} affected</span>`)}

      <div class="header-controls">
        <label for="step-select" style="font-size:13px; color:var(--text-muted); font-weight:500;">Process Step:</label>
        <select id="step-select" class="select-input" data-action="select-step-dropdown">
          ${allSteps
            .map(
              (s) =>
                `<option value="${s.id}" ${s.id === step.id ? "selected" : ""}>${s.name} (${s.avgWait})</option>`
            )
            .join("")}
        </select>
      </div>
    </div>

    <div id="delay-dynamic-region">
      ${renderDelayBody(log, state)}
    </div>

    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
      <button class="btn" data-action="goto-page" data-page="teams">
        View Team Workload →
      </button>
      <button class="btn btn-dark" data-action="goto-page" data-page="compare">
        Compare Cases →
      </button>
    </div>
  `;
}
