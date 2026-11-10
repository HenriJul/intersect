/**
 * Sidebar Page Icons, Title + Info Button Header Helper, and Page-Specific Guide Overlays.
 */

import { computeEmpiricalCohort } from "../data/empiricalCohortData.js?v=9";

export const PAGE_ICONS = {
  overview: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  flow: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="M7.5 6h3.5a3 3 0 0 1 3 3v0a3 3 0 0 0 2.5 3"/><path d="M7.5 18h3.5a3 3 0 0 0 3-3v0a3 3 0 0 1 2.5-3"/></svg>`,
  delays: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>`,
  teams: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  compare: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  timeline: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="14" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="5" y1="18" x2="16" y2="18"/><circle cx="14" cy="6" r="1.8"/><circle cx="20" cy="12" r="1.8"/><circle cx="16" cy="18" r="1.8"/></svg>`
};

export const PAGE_GUIDES = {
  overview: {
    title: "Overview",
    purpose: "Quickly identify the top 3 multi-object bottlenecks across your selected process.",
    steps: [
      {
        heading: "Set Your Global Delay Threshold",
        detail: "Use the 'Delay Threshold' slider in the top-right header to evaluate empirical delayed cohort counts across all 1,106 / 1,166 cases."
      },
      {
        heading: "Review Ranked Bottlenecks (Impact Score or Avg Wait)",
        detail: "By default, bottlenecks are ranked by Composite Business Impact (Wait × Volume × Downstream Cascade). Use the 'Sort' buttons above the list to switch between Impact Score and Raw Avg Wait."
      },
      {
        heading: "Drill Into a Bottleneck",
        detail: "Click 'View in Process Flow' or 'View Delay Breakdown' on any row to lock that step as your active focus across the workspace."
      }
    ]
  },
  flow: {
    title: "Process Flow",
    purpose: "Visualize how separate business objects travel along parallel lanes and meet at shared steps.",
    steps: [
      {
        heading: "Select Any Shared Step",
        detail: "Click (or press Enter/Space on) any vertical pill spanning multiple lanes (e.g. Create Package or Execute Payment) to focus it."
      },
      {
        heading: "Compare Against Delay Threshold",
        detail: "Adjust the 'Delay Threshold' slider in the header to see which shared steps breach (red) or approach (amber) your target."
      },
      {
        heading: "Toggle Exceptions & Delay Chains",
        detail: "Use 'Show Exceptions' to reveal rework loops, or 'Highlight Delay Chain' to see upstream-to-downstream propagation."
      }
    ]
  },
  delays: {
    title: "Delay Breakdown",
    purpose: "Decompose a shared step into OPerA pooling, cross-object lagging, and post-sync team queue waiting.",
    steps: [
      {
        heading: "Switch Process Step & Threshold",
        detail: "Use the 'Process Step' dropdown and 'Delay Threshold' slider in the top-right header to inspect any multi-object step."
      },
      {
        heading: "Read or Toggle Plain-Language Descriptions",
        detail: "Compare 'Waiting for All Items' (OPerA pooling) and 'Waiting for Other Objects' (OPerA lagging) against 'Waiting for Team' (post-sync queue), or click 'Hide / Show Descriptions' in the header."
      },
      {
        heading: "Edit Explanations for This OCEL Schema",
        detail: "Click 'Edit Explanations' to customize plain-language descriptions keyed to this log's OCEL 2.0 objectTypes + eventTypes signature."
      }
    ]
  },
  teams: {
    title: "Team Workload",
    purpose: "See how shared teams split their capacity across competing workflows and where delayed backlogs pile up.",
    steps: [
      {
        heading: "Follow Your Active Focus Step",
        detail: "The top focus bar highlights the team responsible for your selected bottleneck step, or lets you switch focus steps on the fly."
      },
      {
        heading: "Compare Load vs. Empirical Delayed Backlog",
        detail: "Grey bars show team utilization (%) while the red curve tracks delayed cases exceeding your header 'Delay Threshold'."
      },
      {
        heading: "Inspect Peak Backlog Cases",
        detail: "Click 'Compare Cases' or 'View Case Timeline' beneath the chart to move from team capacity to cohort comparison."
      }
    ]
  },
  compare: {
    title: "Compare Cases",
    purpose: "Contrast on-time vs. delayed cohorts with non-parametric significance tests and an empirical what-if simulator.",
    steps: [
      {
        heading: "Adjust the Empirical Delay Threshold",
        detail: "Drag the 'Delay Threshold' slider in the top-right to recompute exact on-time and delayed cohort counts from the event log."
      },
      {
        heading: "Inspect Statistical Significance (95% CI, Cliff's δ, p_BH)",
        detail: "Each factor reports cohort sizes (n), 95% bootstrap confidence intervals, Cliff's δ effect size, and Benjamini–Hochberg adjusted Mann–Whitney U significance."
      },
      {
        heading: "Run the Empirical What-If Simulator",
        detail: "Move the reduction slider on the right to evaluate how many delayed events cross back below your threshold when the primary delay factor is reduced."
      }
    ]
  },
  timeline: {
    title: "Case Timeline",
    purpose: "Verify cross-object delays on concrete OCEL 2.0 instances and close with a quantified operational decision.",
    steps: [
      {
        heading: "Compare Gate Wait vs. End-to-End Duration",
        detail: "Each card badge compares the case's cross-object gate wait directly against your active 'Delay Threshold' alongside its total end-to-end span."
      },
      {
        heading: "Click Any Event Dot for Inline Inspection",
        detail: "Click (or press Enter/Space on) any colored dot along a lane to view its exact timestamp and actor directly inside that case card's header."
      },
      {
        heading: "Review the Recommended Decision",
        detail: "Use the closing Recommendation Card at the bottom of the page to translate the timeline evidence into a concrete operational action."
      }
    ]
  }
};

export function formatDynamicEur(num) {
  if (num >= 1000000) return `€${(num / 1000000).toFixed(2)}M`;
  return `€${Math.round(num).toLocaleString("en-US")}`;
}

export function computeOverviewSlaMetrics(log, slaDays = 3.0) {
  const comp = log.comparison;
  const baseSla = log.defaultSlaDays || 3.0;
  const cohort = computeEmpiricalCohort(log.logId, slaDays, comp.baseStalledEur, baseSla);
  const unitLabel = log.logId === "order-management" ? "delayed packages" : "delayed payments";

  return {
    delayedCount: cohort.delayedCount,
    onTimeCount: cohort.onTimeCount,
    totalCount: cohort.totalCount,
    stalledEur: cohort.stalledEur,
    delayedValueStr: formatDynamicEur(cohort.stalledEur),
    delayedSubStr: `${cohort.delayedCount.toLocaleString("en-US")} of ${cohort.totalCount.toLocaleString("en-US")} ${unitLabel} (> ${slaDays.toFixed(1)}d)`
  };
}

export function computeStepSlaStatus(step, log, slaDays = 3.0) {
  const waitDays = step.breakdown ? step.breakdown.totalDays : parseFloat(step.avgWait) || 0;
  const baseSla = (log && log.defaultSlaDays) || 3.0;
  const cohort = log
    ? computeEmpiricalCohort(log.logId, slaDays, log.comparison.baseStalledEur, baseSla)
    : { delayedCount: 1, baseDelayedCount: 1 };
  const ratio = cohort.delayedCount / Math.max(1, cohort.baseDelayedCount);

  let severity = "blue";
  let badgeClass = "badge-green";
  let statusLabel = `Avg ${waitDays.toFixed(1)}d ≤ ${slaDays.toFixed(1)}d threshold`;
  let gateTag = `${waitDays.toFixed(1)}d (≤ ${slaDays.toFixed(1)}d)`;

  if (waitDays >= slaDays) {
    severity = "red";
    badgeClass = "badge-red";
    statusLabel = `Avg ${waitDays.toFixed(1)}d > ${slaDays.toFixed(1)}d threshold`;
    gateTag = `${waitDays.toFixed(1)}d (> ${slaDays.toFixed(1)}d)`;
  } else if (waitDays >= slaDays * 0.65) {
    severity = "amber";
    badgeClass = "badge-amber";
    statusLabel = `Avg ${waitDays.toFixed(1)}d near ${slaDays.toFixed(1)}d threshold`;
    gateTag = `${waitDays.toFixed(1)}d (≤ ${slaDays.toFixed(1)}d)`;
  }

  let affectedValue = step.affectedValue;
  const raw = String(step.affectedValue || "").trim();
  if (raw.startsWith("€")) {
    const isMillions = raw.endsWith("M");
    const numericPart = parseFloat(raw.replace(/[€M,]/g, ""));
    if (!Number.isNaN(numericPart)) {
      const baseEur = isMillions ? numericPart * 1000000 : numericPart;
      affectedValue = formatDynamicEur(baseEur * ratio);
    }
  } else {
    const match = raw.match(/^([\d,]+)\s+(.*)$/);
    if (match) {
      const baseCount = parseInt(match[1].replace(/,/g, ""), 10);
      if (!Number.isNaN(baseCount)) {
        const scaledCount = Math.max(8, Math.round(baseCount * ratio));
        affectedValue = `${scaledCount.toLocaleString("en-US")} ${match[2]}`;
      }
    }
  }

  return {
    waitDays,
    severity,
    badgeClass,
    statusLabel,
    gateTag,
    affectedValue
  };
}

export function renderFocusStepBanner(log, state, { contextNote = "" } = {}) {
  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const allSteps = Object.values(log.steps);
  const slaDays =
    state && typeof state.slaThresholdDays === "number"
      ? state.slaThresholdDays
      : log.defaultSlaDays || 3.0;
  const slaInfo = computeStepSlaStatus(step, log, slaDays);

  return `
    <div class="focus-context-bar">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span class="focus-chip-label">Active Bottleneck Focus</span>
        <select class="select-input" style="padding:4px 9px; font-size:12.5px; font-weight:600;" data-action="select-focus-step" aria-label="Active bottleneck focus step">
          ${allSteps
            .map(
              (s) =>
                `<option value="${s.id}" ${s.id === step.id ? "selected" : ""}>${s.name} (${s.avgWait} avg)</option>`
            )
            .join("")}
        </select>
        <span class="badge ${slaInfo.badgeClass}">${slaInfo.statusLabel}</span>
        <span style="font-size:12px; color:var(--text-secondary);">
          Primary Blocker: <strong>${step.mainDelaySource}</strong> · Team: <strong>${step.responsibleTeamName || "Shared Staff"}</strong>
        </span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        ${contextNote ? `<span style="font-size:11.5px; color:var(--text-muted);">${contextNote}</span>` : ""}
        <button class="btn btn-sm" data-action="goto-page" data-page="delays">
          Step Breakdown
        </button>
      </div>
    </div>
  `;
}

export function renderDelayThresholdControl(state) {
  const slaNum =
    state && typeof state.slaThresholdDays === "number" ? state.slaThresholdDays : 3.0;
  const slaFormatted = slaNum.toFixed(1);

  return `
    <div class="header-threshold-pill" title="Cases waiting longer than this threshold are flagged as delayed across all pages">
      <span class="header-threshold-label">
        Delay Threshold: <strong id="header-sla-val" style="color:var(--text-primary);">${slaFormatted}d</strong>
      </span>
      <input
        type="range"
        class="range-slider"
        style="width:112px;"
        min="1.5"
        max="7.5"
        step="0.5"
        value="${slaNum}"
        data-action="change-sla"
        aria-label="Delay threshold in days"
      />
    </div>
  `;
}

export function renderPageTitleBlock(title, metaText) {
  return `
    <div>
      <div class="page-title-row">
        <h1 class="page-title">${title}</h1>
        <button class="page-info-btn"
                data-action="open-page-info"
                aria-label="How to use ${title}"
                title="How to use this page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
      </div>
      <div class="page-meta">${metaText}</div>
    </div>
  `;
}

export function renderPageInfoOverlay(pageId, isOpen) {
  if (!isOpen) return "";
  const guide = PAGE_GUIDES[pageId] || PAGE_GUIDES.overview;

  return `
    <div class="modal-overlay" data-action="close-modal-backdrop">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="guide-modal-title">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="display:flex; align-items:center; gap:9px;">
            <span style="width:30px; height:30px; border-radius:8px; background:var(--bg-muted); display:inline-flex; align-items:center; justify-content:center; color:var(--text-primary);">
              ${PAGE_ICONS[pageId] || ""}
            </span>
            <div>
              <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted);">
                How to use this page
              </div>
              <h2 id="guide-modal-title" style="margin:0; font-size:18px; font-weight:700; letter-spacing:-0.02em;">
                ${guide.title}
              </h2>
            </div>
          </div>

          <button class="btn btn-sm" data-action="close-modal" aria-label="Close guide">Close</button>
        </div>

        <p style="margin:12px 0 0; font-size:13.5px; color:var(--text-secondary);">
          ${guide.purpose}
        </p>

        <div class="guide-step-list">
          ${guide.steps
            .map(
              (st, idx) => `
              <div class="guide-step-item">
                <span class="guide-step-num">${idx + 1}</span>
                <div>
                  <div style="font-weight:600; font-size:13.5px; color:var(--text-primary);">${st.heading}</div>
                  <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">${st.detail}</div>
                </div>
              </div>
            `
            )
            .join("")}
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button class="btn btn-dark" data-action="close-modal">Got it</button>
        </div>
      </div>
    </div>
  `;
}
