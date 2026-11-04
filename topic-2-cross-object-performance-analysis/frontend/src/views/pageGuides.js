/**
 * Sidebar Page Icons, Title + Info Button Header Helper, and Page-Specific Guide Overlays.
 */

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
        detail: "Use the 'Delay Threshold' slider in the top-right header to define what wait time counts as a breach across all pages."
      },
      {
        heading: "Review Ranked Bottlenecks",
        detail: "The top 3 bottlenecks are ranked by average cross-object wait time, with color dots and impact scaling to your threshold."
      },
      {
        heading: "Drill Into a Bottleneck",
        detail: "Click 'View in Process Flow' or 'View Delay Breakdown' on any row to inspect that step directly."
      }
    ]
  },
  flow: {
    title: "Process Flow",
    purpose: "Visualize how separate business objects travel along parallel lanes and meet at shared steps.",
    steps: [
      {
        heading: "Select Any Shared Step",
        detail: "Click any vertical pill spanning multiple lanes (e.g. Create Package or Execute Payment) to focus it."
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
    purpose: "Understand whether a shared step is slow due to missing objects or an overloaded team, and customize explanations for your log type.",
    steps: [
      {
        heading: "Switch Process Step & Threshold",
        detail: "Use the 'Process Step' dropdown and 'Delay Threshold' slider in the top-right header to inspect any multi-object step."
      },
      {
        heading: "Read the Plain-Language Wait Split",
        detail: "Compare time spent 'Waiting for All Items' and 'Waiting for Other Objects' against 'Waiting for Team', along with plain-English explanations."
      },
      {
        heading: "Edit Explanations for This Log Type",
        detail: "Click 'Edit Explanations' to open the schema text editor overlay. Custom descriptions are saved to this log's schema (its object and event types) and automatically reused whenever a matching OCEL is loaded."
      }
    ]
  },
  teams: {
    title: "Team Workload",
    purpose: "See how shared teams split their capacity across competing workflows and where delayed backlogs pile up.",
    steps: [
      {
        heading: "Choose a Team on the Left",
        detail: "Click Warehousing, Shipment, Finance, or Procurement to inspect that group's workload distribution."
      },
      {
        heading: "Compare Load vs. Delayed Backlog",
        detail: "Grey bars show team utilization (%) while the red curve tracks delayed cases exceeding your header 'Delay Threshold'."
      },
      {
        heading: "Inspect Peak Backlog Cases",
        detail: "Click 'View Case Timeline' beneath the chart to examine an individual delayed case."
      }
    ]
  },
  compare: {
    title: "Compare Cases",
    purpose: "Contrast on-time cases against delayed cases and estimate the benefit of reducing the main delay.",
    steps: [
      {
        heading: "Adjust the Global Delay Threshold",
        detail: "Drag the 'Delay Threshold' slider in the top-right to redefine what counts as a delayed case across the entire app."
      },
      {
        heading: "Compare Top Delay Factors",
        detail: "Red vs. green bars show how much longer cases wait when a specific condition (like an out-of-stock item) occurs."
      },
      {
        heading: "Estimate Improvement",
        detail: "Move the reduction slider on the right to preview how many cases and euros would move back on track."
      }
    ]
  },
  timeline: {
    title: "Case Timeline",
    purpose: "Verify cross-object delays on concrete real-world examples from the event log.",
    steps: [
      {
        heading: "Switch Between Examples",
        detail: "Use the top-right tabs to view a 'Delayed Example', an 'On-Time Example', or 'Show Both' together."
      },
      {
        heading: "Spot the Shaded Wait Window",
        detail: "Each row is one individual object; the shaded red band highlights where early objects sat waiting on late ones."
      },
      {
        heading: "Inspect Individual Events",
        detail: "Click any colored dot along a row to see its exact timestamp and responsible employee or department below."
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
  const ratio = Math.pow(baseSla / Math.max(1.0, slaDays), 0.78);
  const delayedCount = Math.min(
    comp.totalClusters - 40,
    Math.max(45, Math.round(comp.baseDelayedAt3d * ratio))
  );
  const stalledEur = comp.baseStalledEur * (delayedCount / comp.baseDelayedAt3d);
  const unitLabel = log.logId === "order-management" ? "delayed packages" : "delayed payments";

  return {
    delayedCount,
    stalledEur,
    delayedValueStr: formatDynamicEur(stalledEur),
    delayedSubStr: `${delayedCount.toLocaleString("en-US")} ${unitLabel} (> ${slaDays.toFixed(1)}d)`
  };
}

export function computeStepSlaStatus(step, log, slaDays = 3.0) {
  const waitDays = step.breakdown ? step.breakdown.totalDays : parseFloat(step.avgWait) || 0;
  const baseSla = (log && log.defaultSlaDays) || 3.0;
  const ratio = Math.pow(baseSla / Math.max(1.0, slaDays), 0.72);

  let severity = "blue";
  let badgeClass = "badge-green";
  let statusLabel = `Within ${slaDays.toFixed(1)}d threshold`;

  if (waitDays >= slaDays) {
    severity = "red";
    badgeClass = "badge-red";
    statusLabel = `Exceeds ${slaDays.toFixed(1)}d threshold`;
  } else if (waitDays >= slaDays * 0.65) {
    severity = "amber";
    badgeClass = "badge-amber";
    statusLabel = `Near ${slaDays.toFixed(1)}d threshold`;
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
        const scaledCount = Math.max(12, Math.round(baseCount * ratio));
        affectedValue = `${scaledCount.toLocaleString("en-US")} ${match[2]}`;
      }
    }
  }

  return {
    waitDays,
    severity,
    badgeClass,
    statusLabel,
    affectedValue
  };
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
