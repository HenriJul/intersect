/**
 * Subpage 2: Process Flow
 */

import { renderPageTitleBlock } from "./pageGuides.js";

function renderOrderManagementPaths(showExceptions, showChain, selectedStepId) {
  const hi = showChain;

  return `
    <path d="M 164 78 L 315 78 L 745 78" stroke="#2563eb" stroke-width="2" fill="none" stroke-opacity="0.45" />
    <path d="M 315 178 L 445 178" stroke="#d97706" stroke-width="2.2" fill="none" stroke-opacity="0.6" />
    <path d="M 445 178 L 575 178"
          stroke="${selectedStepId === "create-package" || hi ? "#dc2626" : "#d97706"}"
          stroke-width="${selectedStepId === "create-package" || hi ? "3.6" : "2.4"}"
          fill="none" />

    <path d="M 225 278 L 820 278" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4 3" fill="none" stroke-opacity="0.5" />
    <path d="M 575 374 L 695 374 L 820 374" stroke="#059669" stroke-width="2.4" fill="none" stroke-opacity="0.7" />

    <path d="M 575 178 L 745 178"
          stroke="${selectedStepId === "pay-order" || hi ? "#d97706" : "#94a3b8"}"
          stroke-width="${selectedStepId === "pay-order" || hi ? "3" : "1.8"}"
          stroke-dasharray="${hi ? "none" : "5 3"}"
          fill="none" />

    ${
      showExceptions || hi
        ? `
          <path d="M 402 178 C 402 118, 488 118, 488 178" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />
          <path d="M 708 78 C 708 26, 792 26, 792 78" stroke="#d97706" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />
          <path d="M 780 374 C 780 422, 852 422, 852 374" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />
        `
        : ""
    }
  `;
}

function renderP2PPaths(showExceptions, showChain, selectedStepId) {
  const hi = showChain;

  return `
    <path d="M 164 78 L 310 78" stroke="#4f46e5" stroke-width="2.2" fill="none" stroke-opacity="0.6" />
    <path d="M 310 78 C 355 78, 360 178, 400 178" stroke="${hi ? "#d97706" : "#4f46e5"}" stroke-width="2.2" fill="none" stroke-opacity="0.6" />
    <path d="M 310 78 L 575 78" stroke="#4f46e5" stroke-width="1.6" stroke-dasharray="4 3" fill="none" stroke-opacity="0.4" />

    <path d="M 400 178 L 830 178" stroke="#2563eb" stroke-width="2.2" fill="none" stroke-opacity="0.55" />
    <path d="M 575 178 C 615 178, 620 278, 660 278" stroke="${hi ? "#d97706" : "#2563eb"}" stroke-width="2.2" fill="none" stroke-opacity="0.6" />

    <path d="M 660 278 L 745 278 L 830 278"
          stroke="${selectedStepId === "execute-payment" || selectedStepId === "two-way-match" || hi ? "#dc2626" : "#d97706"}"
          stroke-width="${selectedStepId === "execute-payment" || selectedStepId === "two-way-match" || hi ? "3.6" : "2.4"}"
          fill="none" />

    <path d="M 610 374 L 830 374" stroke="#059669" stroke-width="2.4" fill="none" stroke-opacity="0.7" />

    ${
      showExceptions || hi
        ? `
          <path d="M 215 78 C 215 26, 295 26, 295 78" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />
          <path d="M 622 278 C 622 222, 698 222, 698 278" stroke="#d97706" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />
        `
        : ""
    }
  `;
}

function renderFlowDiagramSvg(log, state) {
  const { tracks, flowGraph } = log;
  const trackMap = Object.fromEntries(tracks.map((t) => [t.id, t]));
  const showLoops = state.showExceptions || state.showChain;

  const lanesSvg = tracks
    .map(
      (t) => `
      <g>
        <line x1="164" y1="${t.y}" x2="882" y2="${t.y}" stroke="var(--svg-lane-line)" stroke-width="1.5" />
        <circle cx="18" cy="${t.y - 5}" r="4.5" fill="${t.color}" />
        <text x="30" y="${t.y - 1}" font-size="12.5" font-weight="600" fill="var(--text-primary)">${t.label}</text>
        <text x="30" y="${t.y + 14}" font-size="10.5" fill="var(--text-faint)">${t.sub}</text>
      </g>
    `
    )
    .join("");

  const paths =
    log.logId === "order-management"
      ? renderOrderManagementPaths(state.showExceptions, state.showChain, state.selectedStepId)
      : renderP2PPaths(state.showExceptions, state.showChain, state.selectedStepId);

  const singleNodes = flowGraph.singleSteps
    .map((s) => {
      const tr = trackMap[s.track];
      return `
        <g transform="translate(${s.x}, ${s.y})">
          <rect x="-44" y="-15" width="88" height="30" rx="15" fill="var(--svg-node-bg)" stroke="var(--svg-node-stroke)" />
          <circle cx="-31" cy="0" r="3.5" fill="${tr ? tr.color : "var(--text-muted)"}" />
          <text x="4" y="3.5" text-anchor="middle" font-size="10.5" font-weight="500" fill="var(--text-secondary)">${s.label}</text>
        </g>
      `;
    })
    .join("");

  const exceptionNodes = showLoops
    ? flowGraph.exceptionLoops
        .map(
          (ex) => `
          <g transform="translate(${ex.x}, ${ex.y})">
            <rect x="-64" y="-12" width="128" height="24" rx="6" fill="var(--svg-node-bg)" stroke="${ex.color}" stroke-dasharray="3 2" />
            <text x="0" y="3.5" text-anchor="middle" font-size="9.5" font-weight="600" fill="${ex.color}">${ex.label} (${ex.count})</text>
          </g>
        `
        )
        .join("")
    : "";

  const sharedNodes = flowGraph.sharedSteps
    .map((g) => {
      const isSelected = g.id === state.selectedStepId;
      const meta = log.steps[g.id];
      const height = g.yBottom - g.yTop;
      const midY = (g.yTop + g.yBottom) / 2;
      const accent = meta.severity === "red" ? "var(--red)" : meta.severity === "amber" ? "var(--amber)" : "var(--blue)";

      const dots = g.tracksJoined
        .map((tid) => {
          const tr = trackMap[tid];
          if (!tr) return "";
          return `<circle cx="${g.x}" cy="${tr.y}" r="4.5" fill="var(--svg-node-bg)" stroke="${tr.color}" stroke-width="2.2" />`;
        })
        .join("");

      return `
        <g class="flow-step-clickable" data-action="select-step" data-step-id="${g.id}">
          <rect x="${g.x - 14}" y="${g.yTop}" width="28" height="${height}" rx="10"
                fill="${isSelected ? "var(--svg-gate-selected-fill)" : "var(--svg-gate-fill)"}"
                stroke="${isSelected ? "var(--text-primary)" : "var(--svg-node-stroke)"}" />
          ${dots}
          <rect class="step-card" x="${g.x - 55}" y="${midY - 21}" width="110" height="42" rx="8"
                fill="${isSelected ? "var(--btn-dark-bg)" : "var(--svg-node-bg)"}"
                stroke="${isSelected ? "var(--btn-dark-bg)" : "var(--text-faint)"}"
                stroke-width="${isSelected ? "2" : "1.2"}" />
          <text x="${g.x}" y="${midY - 3}" text-anchor="middle" font-size="10.5" font-weight="600"
                fill="${isSelected ? "var(--btn-dark-fg)" : "var(--text-primary)"}">${g.label}</text>
          <text x="${g.x}" y="${midY + 12}" text-anchor="middle" font-size="9.5" font-weight="600"
                fill="${isSelected ? "#ef4444" : accent}">${g.waitTag}</text>
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 895 450" style="width:100%; min-width:740px; height:auto; display:block;">
      ${lanesSvg}
      ${paths}
      ${singleNodes}
      ${exceptionNodes}
      ${sharedNodes}
    </svg>
  `;
}

export function renderFlowBody(log, state) {
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];

  return `
    <div class="card" style="padding:18px 20px;">
      <div class="diagram-frame">
        ${renderFlowDiagramSvg(log, state)}
      </div>

      ${
        state.showChain
          ? `
            <div class="chain-horizontal">
              <div>
                <div style="font-size:11px; color:var(--amber-heading); font-weight:600;">${step.chain[0].stage}</div>
                <div style="font-weight:700; font-size:13.5px;">${step.chain[0].name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${step.chain[0].metric}</div>
              </div>
              <div style="color:var(--amber); font-weight:700;">→</div>
              <div>
                <div style="font-size:11px; color:var(--amber-heading); font-weight:600;">${step.chain[1].stage}</div>
                <div style="font-weight:700; font-size:13.5px;">${step.chain[1].name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${step.chain[1].metric}</div>
              </div>
              <div style="color:var(--amber); font-weight:700;">→</div>
              <div>
                <div style="font-size:11px; color:var(--amber-heading); font-weight:600;">${step.chain[2].stage}</div>
                <div style="font-weight:700; font-size:13.5px;">${step.chain[2].name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${step.chain[2].metric}</div>
              </div>
            </div>
          `
          : ""
      }
    </div>

    <div class="card sub-animate" style="margin-top:16px; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap;">
        <div>
          <div class="bn-stat-label">Selected Step</div>
          <div style="font-size:15.5px; font-weight:700;">${step.name}</div>
        </div>
        <div>
          <div class="bn-stat-label">Avg Wait</div>
          <div style="font-size:15px; font-weight:600;">${step.avgWait}</div>
        </div>
        <div>
          <div class="bn-stat-label">Main Delay Source</div>
          <div style="font-size:15px; font-weight:600;">${step.mainDelaySource}</div>
        </div>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn" data-action="goto-page" data-page="timeline">
          View Case Timeline
        </button>
        <button class="btn btn-dark" data-action="goto-page" data-page="delays">
          Open Delay Breakdown →
        </button>
      </div>
    </div>
  `;
}

export function renderFlowMapView(log, state) {
  return `
    <div class="page-header">
      ${renderPageTitleBlock("Process Flow", "Click any shared vertical step to select it")}

      <div class="header-controls">
        <button id="btn-toggle-exceptions" class="btn ${state.showExceptions ? "btn-dark" : ""}" data-action="toggle-exceptions">
          Show Exceptions
        </button>
        <button id="btn-toggle-chain" class="btn ${state.showChain ? "btn-dark" : ""}" data-action="toggle-chain">
          Highlight Delay Chain
        </button>
      </div>
    </div>

    <div id="flow-dynamic-region">
      ${renderFlowBody(log, state)}
    </div>
  `;
}
