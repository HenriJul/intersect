/**
 * Intersect — Frontend Application Controller (`frontend/src/main.js`)
 *
 * Boots onto a sidebar-free default starter page when no event log is selected,
 * and transitions into the persistent gliding-sidebar workspace once an OCEL log
 * is chosen via dropdown or file upload.
 */

import { getLogPayload, probePythonBackend } from "./api/ocelClient.js?v=13";
import { DEMO_LOGS, RAW_DEMO_LOGS } from "./data/demoPayloads.js?v=13";
import {
  pageToEditorTab,
  renderSchemaTextEditorModal,
  resetAllSchemaExplanations,
  saveFullSchemaExplanations
} from "./data/schemaTexts.js?v=13";
import { renderCapacityView, renderTeamChartCard } from "./views/capacityView.js?v=13";
import { computeComparisonMetrics, renderComparisonView } from "./views/comparisonView.js?v=13";
import { renderDelayBody, renderDelayView } from "./views/delayView.js?v=13";
import { renderFlowBody, renderFlowMapView } from "./views/flowMapView.js?v=14";
import { renderOverviewBody, renderOverviewView } from "./views/overviewView.js?v=13";
import {
  PAGE_ICONS,
  computeStepSlaStatus,
  renderPageInfoOverlay
} from "./views/pageGuides.js?v=13";
import { renderBrandMarkSvg, renderStarterView } from "./views/starterView.js?v=13";
import {
  TIMELINE_MODES,
  renderTimelineCardsRegion,
  renderTimelineView
} from "./views/timelineView.js?v=13";
import { renderUploadModal } from "./views/uploadModal.js?v=13";

const SUBPAGES = [
  { id: "overview", label: "Overview" },
  { id: "flow", label: "Process Flow" },
  { id: "delays", label: "Delay Breakdown" },
  { id: "teams", label: "Team Workload" },
  { id: "compare", label: "Compare Cases" },
  { id: "timeline", label: "Case Timeline" }
];

function loadSavedDarkPreference() {
  try {
    return localStorage.getItem("intersect-theme") === "dark";
  } catch {
    return false;
  }
}

const state = {
  logId: null, // Starts unselected so the user lands on the default starter page
  darkMode: loadSavedDarkPreference(),
  activePage: "overview",
  selectedStepId: "create-package",
  showExceptions: false,
  showChain: false,
  showDelayDescriptions: true,
  selectedTeamId: "warehousing",
  slaThresholdDays: 3.0,
  whatIfReductionPct: 40,
  timelineMode: "delayed",
  selectedEventKey: null,
  selectedEventInfo: null,
  pageInfoOpen: false,
  uploadModalOpen: false,
  schemaEditorOpen: false,
  schemaEditorTab: "steps",
  apiStatus: { connected: false, mode: "Static Demo" }
};

let mountedShellMode = null; // "starter" | "workspace"
let themeTransitionTimer = null;

function applyTheme(dark, { animate = false } = {}) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-transitioning");
    clearTimeout(themeTransitionTimer);
    themeTransitionTimer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 430);
  }

  if (dark) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }

  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-pressed", String(dark));
  }

  try {
    localStorage.setItem("intersect-theme", dark ? "dark" : "light");
  } catch {
    // Ignore storage restrictions
  }
}

function initAppFrame() {
  const appEl = document.getElementById("app");
  appEl.innerHTML = `
    <div id="app-shell" class="app-shell"></div>
    <button
      id="theme-toggle-btn"
      class="theme-toggle-btn"
      data-action="toggle-theme"
      aria-label="Toggle night mode"
      aria-pressed="${state.darkMode}"
      title="Toggle night mode"
    >
      <svg class="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="4.2"/>
        <line x1="12" y1="19.8" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="6.49" y2="6.49"/>
        <line x1="17.51" y1="17.51" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="4.2" y2="12"/>
        <line x1="19.8" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="6.49" y2="17.51"/>
        <line x1="17.51" y1="6.49" x2="19.07" y2="4.93"/>
      </svg>
    </button>
    <div id="modal-root"></div>
  `;
}

function selectLog(newLogId) {
  if (!newLogId) {
    state.logId = null;
    state.pageInfoOpen = false;
    state.schemaEditorOpen = false;
    state.selectedEventKey = null;
    state.selectedEventInfo = null;
    return;
  }

  const wasUnselected = state.logId === null;
  const log = getLogPayload(newLogId);
  state.logId = log.logId;
  if (wasUnselected) {
    state.activePage = "overview";
  }
  state.selectedStepId = log.defaultStepId;
  state.selectedTeamId = log.capacity.defaultTeamId;
  state.slaThresholdDays = log.defaultSlaDays;
  state.showExceptions = false;
  state.showChain = false;
  state.schemaEditorOpen = false;
  state.selectedEventKey = null;
  state.selectedEventInfo = null;
}

function syncStepAndTeam(log, stepId) {
  state.selectedStepId = stepId;
  const step = log.steps[stepId];
  if (step && step.responsibleTeamId) {
    state.selectedTeamId = step.responsibleTeamId;
  }
}

function renderWorkspaceShellHtml() {
  const activeIdx = Math.max(
    0,
    SUBPAGES.findIndex((p) => p.id === state.activePage)
  );

  return `
    <aside class="sidebar">
      <button class="sidebar-brand" data-action="go-starter" title="Return to event log selection">
        <span class="brand-icon" aria-hidden="true">
          ${renderBrandMarkSvg(22)}
        </span>
        <span class="brand-name">Intersect</span>
      </button>

      <div class="sidebar-nav-wrap">
        <nav class="nav-list" aria-label="Subpages">
          <div id="sidebar-glider" class="nav-glider" style="transform: translateY(${activeIdx * 42}px);"></div>
          ${SUBPAGES.map(
            (p) => `
            <button class="nav-item ${state.activePage === p.id ? "active" : ""}"
                    data-action="goto-page"
                    data-page="${p.id}">
              ${PAGE_ICONS[p.id]}
              <span>${p.label}</span>
            </button>
          `
          ).join("")}
        </nav>
      </div>

      <div class="sidebar-footer">
        <label for="dataset-select" class="sidebar-field-label">Dataset</label>
        <div class="sidebar-select-wrap">
          <select id="dataset-select" class="sidebar-select" data-action="switch-log-dropdown">
            ${Object.keys(RAW_DEMO_LOGS)
              .map(
                (id) =>
                  `<option value="${id}" ${state.logId === id ? "selected" : ""}>${DEMO_LOGS[id].title}</option>`
              )
              .join("")}
            <option value="">No log selected</option>
          </select>
        </div>

        <button class="btn btn-sm" style="width:100%; justify-content:center;" data-action="open-upload">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Upload Event Log</span>
        </button>

        <div id="api-status-row" class="api-indicator">
          <span class="dot ${state.apiStatus.connected ? "green" : "blue"}" style="width:6px; height:6px;"></span>
          <span>${state.apiStatus.connected ? "Python API Connected" : "Static Demo Mode"}</span>
        </div>
      </div>
    </aside>

    <main class="main-canvas">
      <div id="page-root" class="page-wrap"></div>
    </main>
  `;
}

function syncAppView({ animatePage = true } = {}) {
  const shellEl = document.getElementById("app-shell");
  if (!shellEl) return;

  if (!state.logId) {
    mountedShellMode = "starter";
    shellEl.innerHTML = renderStarterView();
    syncOverlays();
    return;
  }

  if (mountedShellMode !== "workspace") {
    mountedShellMode = "workspace";
    shellEl.innerHTML = renderWorkspaceShellHtml();
  }

  syncSidebarUI();
  renderPage({ animate: animatePage });
  syncOverlays();
}

function syncSidebarUI() {
  if (mountedShellMode !== "workspace") return;

  const activeIdx = Math.max(
    0,
    SUBPAGES.findIndex((p) => p.id === state.activePage)
  );
  const glider = document.getElementById("sidebar-glider");
  if (glider) {
    glider.style.transform = `translateY(${activeIdx * 42}px)`;
  }

  document.querySelectorAll(".sidebar .nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === state.activePage);
  });

  const dsSelect = document.getElementById("dataset-select");
  if (dsSelect) {
    Object.keys(RAW_DEMO_LOGS).forEach((id) => {
      const opt = dsSelect.querySelector(`option[value="${id}"]`);
      if (opt) opt.textContent = DEMO_LOGS[id].title;
    });
    if (dsSelect.value !== (state.logId || "")) {
      dsSelect.value = state.logId || "";
    }
  }

  const apiRow = document.getElementById("api-status-row");
  if (apiRow) {
    apiRow.innerHTML = `
      <span class="dot ${state.apiStatus.connected ? "green" : "blue"}" style="width:6px; height:6px;"></span>
      <span>${state.apiStatus.connected ? "Python API Connected" : "Static Demo Mode"}</span>
    `;
  }
}

function syncOverlays() {
  const shell = document.getElementById("app-shell");
  const themeBtn = document.getElementById("theme-toggle-btn");
  const modalRoot = document.getElementById("modal-root");
  const hasOverlay = state.pageInfoOpen || state.uploadModalOpen || state.schemaEditorOpen;

  if (shell) {
    shell.classList.toggle("is-blurred", hasOverlay);
  }
  if (themeBtn) {
    themeBtn.classList.toggle("is-blurred", hasOverlay);
  }
  if (modalRoot) {
    if (state.pageInfoOpen && state.logId) {
      modalRoot.innerHTML = renderPageInfoOverlay(state.activePage, true);
    } else if (state.schemaEditorOpen && state.logId) {
      const log = getLogPayload(state.logId);
      modalRoot.innerHTML = renderSchemaTextEditorModal(log, state, true);
    } else if (state.uploadModalOpen) {
      modalRoot.innerHTML = renderUploadModal(true);
    } else {
      modalRoot.innerHTML = "";
    }
  }
}

function getActivePageHtml(log) {
  switch (state.activePage) {
    case "overview":
      return renderOverviewView(log, state);
    case "flow":
      return renderFlowMapView(log, state);
    case "delays":
      return renderDelayView(log, state);
    case "teams":
      return renderCapacityView(log, state);
    case "compare":
      return renderComparisonView(log, state);
    case "timeline":
      return renderTimelineView(log, state);
    default:
      return renderOverviewView(log, state);
  }
}

function renderPage({ animate = true } = {}) {
  if (!state.logId) return;
  const pageRoot = document.getElementById("page-root");
  if (!pageRoot) return;

  const log = getLogPayload(state.logId);
  pageRoot.innerHTML = getActivePageHtml(log);

  if (animate) {
    pageRoot.classList.remove("page-animate");
    void pageRoot.offsetWidth;
    pageRoot.classList.add("page-animate");
  }
}

function updateComparisonNumbersInPlace() {
  if (!state.logId) return;
  const log = getLogPayload(state.logId);
  const m = computeComparisonMetrics(log, state);

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt("cmp-meta-text", `On-time vs. delayed (> ${state.slaThresholdDays.toFixed(1)} days wait)`);
  setTxt("header-sla-val", `${state.slaThresholdDays.toFixed(1)}d`);
  setTxt("cmp-ontime-count", m.onTimeCount);
  setTxt("cmp-ontime-pct", m.onTimePct);
  setTxt("cmp-delayed-count", m.delayedCount);
  setTxt("cmp-delayed-pct", m.delayedPct);
  setTxt("cmp-stalled-eur", m.stalledEur);
  setTxt("cmp-whatif-pct", `-${state.whatIfReductionPct}%`);
  setTxt("cmp-recovered", m.recoveredCases);
  setTxt("cmp-unblocked", m.unblockedEur);
  setTxt("cmp-ripples", m.fewerRipples);
}

function updateSlaAcrossActivePage() {
  if (!state.logId) return;
  const log = getLogPayload(state.logId);
  const slaValEl = document.getElementById("header-sla-val");
  if (slaValEl) {
    slaValEl.textContent = `${state.slaThresholdDays.toFixed(1)}d`;
  }

  if (state.activePage === "overview") {
    const region = document.getElementById("overview-dynamic-region");
    if (region) region.innerHTML = renderOverviewBody(log, state);
  } else if (state.activePage === "flow") {
    const region = document.getElementById("flow-dynamic-region");
    if (region) region.innerHTML = renderFlowBody(log, state);
  } else if (state.activePage === "delays") {
    const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
    const slaInfo = computeStepSlaStatus(step, log, state.slaThresholdDays);
    const metaEl = document.getElementById("delay-meta-text");
    if (metaEl) {
      metaEl.textContent = `${step.volume} · ${slaInfo.affectedValue} affected (> ${state.slaThresholdDays.toFixed(1)}d threshold)`;
    }
    const region = document.getElementById("delay-dynamic-region");
    if (region) region.innerHTML = renderDelayBody(log, state);
  } else if (state.activePage === "teams") {
    const activeTeam =
      log.capacity.teams.find((t) => t.id === state.selectedTeamId) || log.capacity.teams[0];
    const chartRegion = document.getElementById("team-chart-region");
    if (chartRegion) chartRegion.innerHTML = renderTeamChartCard(activeTeam, log, state);
  } else if (state.activePage === "compare") {
    updateComparisonNumbersInPlace();
  } else if (state.activePage === "timeline") {
    const region = document.getElementById("timeline-cards-region");
    if (region) region.innerHTML = renderTimelineCardsRegion(log, state);
  }
}

function collectAndSaveSchemaForm(log, stepId) {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  // Tab 1: Overview & Flow
  const kpiNodes = Array.from(document.querySelectorAll("[data-kpi-idx]"));
  const tracks = {};
  document.querySelectorAll("[data-track-label-id]").forEach((el) => {
    const tid = el.dataset.trackLabelId;
    tracks[tid] = tracks[tid] || {};
    tracks[tid].label = el.value.trim();
  });
  document.querySelectorAll("[data-track-sub-id]").forEach((el) => {
    const tid = el.dataset.trackSubId;
    tracks[tid] = tracks[tid] || {};
    tracks[tid].sub = el.value.trim();
  });

  const singleSteps = {};
  document.querySelectorAll("[data-single-step-id]").forEach((el) => {
    singleSteps[el.dataset.singleStepId] = el.value.trim();
  });

  const exceptionLoops = {};
  document.querySelectorAll("[data-exception-id]").forEach((el) => {
    exceptionLoops[el.dataset.exceptionId] = el.value.trim();
  });

  // Tab 2: Step Explanations
  const sourceLabelNodes = Array.from(document.querySelectorAll("[data-source-label-idx]"));
  const sourceDescNodes = Array.from(document.querySelectorAll("[data-source-idx]"));
  const chainNameNodes = Array.from(document.querySelectorAll("[data-chain-name-idx]"));
  const chainDescNodes = Array.from(document.querySelectorAll("[data-chain-idx]"));

  const stepUpdates = {
    name: getVal("field-step-name"),
    mainDelaySource: getVal("field-step-main-source"),
    primaryCauseTag: getVal("field-step-cause-tag"),
    summaryText: getVal("field-summary-text"),
    allItemsDesc: getVal("field-all-items-desc"),
    otherObjectsDesc: getVal("field-other-objects-desc"),
    teamDesc: getVal("field-team-desc"),
    delaySourceLabels: sourceLabelNodes.map((n) => n.value.trim()),
    delaySourceDescs: sourceDescNodes.map((n) => n.value.trim()),
    chainNames: chainNameNodes.map((n) => n.value.trim()),
    chainDescs: chainDescNodes.map((n) => n.value.trim())
  };

  // Tab 3: Team Workload
  const teams = {};
  document.querySelectorAll("[data-team-name-id]").forEach((el) => {
    const teamId = el.dataset.teamNameId;
    teams[teamId] = teams[teamId] || { splitLabels: [] };
    teams[teamId].name = el.value.trim();
  });
  document.querySelectorAll("[data-team-peak-id]").forEach((el) => {
    const teamId = el.dataset.teamPeakId;
    teams[teamId] = teams[teamId] || { splitLabels: [] };
    teams[teamId].peakSummary = el.value.trim();
  });
  document.querySelectorAll("[data-team-split-id]").forEach((el) => {
    const teamId = el.dataset.teamSplitId;
    const idx = parseInt(el.dataset.teamSplitIdx, 10);
    teams[teamId] = teams[teamId] || { splitLabels: [] };
    teams[teamId].splitLabels[idx] = el.value.trim();
  });

  // Tab 4: Compare & Timeline
  const factorTitleNodes = Array.from(document.querySelectorAll("[data-factor-title-idx]"));
  const comparison = {
    delayTargetLabel: getVal("field-cmp-target"),
    rippleUnit: getVal("field-cmp-ripple"),
    factorTitles: factorTitleNodes.map((n) => n.value.trim())
  };

  const timeline = {
    delayedCase: {
      caseId: getVal("field-tl-delayed-id"),
      meta: getVal("field-tl-delayed-meta"),
      waitSummary: getVal("field-tl-delayed-wait")
    },
    healthyCase: {
      caseId: getVal("field-tl-healthy-id"),
      meta: getVal("field-tl-healthy-meta"),
      waitSummary: getVal("field-tl-healthy-wait")
    }
  };

  saveFullSchemaExplanations(log, stepId, {
    processTitle: getVal("field-process-title"),
    delayedUnitLabel: getVal("field-delayed-unit"),
    kpiLabels: kpiNodes.map((n) => n.value.trim()),
    tracks,
    singleSteps,
    exceptionLoops,
    step: stepUpdates,
    teams,
    comparison,
    timeline
  });
}

/* ---------- Delegated Event Listeners ---------- */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;

  if (action === "toggle-theme") {
    state.darkMode = !state.darkMode;
    applyTheme(state.darkMode, { animate: true });
    return;
  }

  if (action === "go-starter") {
    selectLog(null);
    syncAppView();
    return;
  }

  if (action === "open-page-info") {
    state.pageInfoOpen = true;
    state.uploadModalOpen = false;
    state.schemaEditorOpen = false;
    syncOverlays();
    return;
  }

  if (action === "open-upload") {
    state.uploadModalOpen = true;
    state.pageInfoOpen = false;
    state.schemaEditorOpen = false;
    syncOverlays();
    return;
  }

  if (action === "open-schema-editor") {
    state.schemaEditorOpen = true;
    state.schemaEditorTab = pageToEditorTab(state.activePage);
    state.pageInfoOpen = false;
    state.uploadModalOpen = false;
    syncOverlays();
    return;
  }

  if (action === "set-schema-editor-tab") {
    const nextTab = target.dataset.tab || "steps";
    state.schemaEditorTab = nextTab;
    document.querySelectorAll('[data-action="set-schema-editor-tab"]').forEach((btn) => {
      btn.classList.toggle("btn-dark", btn.dataset.tab === nextTab);
    });
    document.querySelectorAll("[data-editor-panel]").forEach((panel) => {
      panel.style.display = panel.dataset.editorPanel === nextTab ? "flex" : "none";
    });
    return;
  }

  if (action === "close-modal") {
    state.pageInfoOpen = false;
    state.uploadModalOpen = false;
    state.schemaEditorOpen = false;
    syncOverlays();
    return;
  }

  if (action === "close-modal-backdrop" && e.target === target) {
    state.pageInfoOpen = false;
    state.uploadModalOpen = false;
    state.schemaEditorOpen = false;
    syncOverlays();
    return;
  }

  if (!state.logId) return;
  const log = getLogPayload(state.logId);

  if (action === "save-schema-texts") {
    collectAndSaveSchemaForm(log, state.selectedStepId);
    state.schemaEditorOpen = false;
    syncOverlays();
    syncSidebarUI();
    renderPage({ animate: false });
    return;
  }

  if (action === "reset-schema-texts") {
    resetAllSchemaExplanations(log);
    syncOverlays();
    syncSidebarUI();
    renderPage({ animate: false });
    return;
  }

  if (action === "goto-page") {
    const nextPage = target.dataset.page;
    if (nextPage === state.activePage) return;
    state.activePage = nextPage;
    syncSidebarUI();
    renderPage({ animate: true });
  } else if (action === "jump-step-page") {
    syncStepAndTeam(log, target.dataset.stepId);
    state.activePage = target.dataset.page;
    syncSidebarUI();
    renderPage({ animate: true });
  } else if (action === "select-step") {
    syncStepAndTeam(log, target.dataset.stepId);
    const flowRegion = document.getElementById("flow-dynamic-region");
    if (flowRegion) {
      flowRegion.innerHTML = renderFlowBody(log, state);
    } else {
      renderPage({ animate: false });
    }
  } else if (action === "toggle-exceptions") {
    state.showExceptions = !state.showExceptions;
    target.classList.toggle("btn-dark", state.showExceptions);
    const flowRegion = document.getElementById("flow-dynamic-region");
    if (flowRegion) flowRegion.innerHTML = renderFlowBody(log, state);
  } else if (action === "toggle-chain") {
    state.showChain = !state.showChain;
    target.classList.toggle("btn-dark", state.showChain);
    const flowRegion = document.getElementById("flow-dynamic-region");
    if (flowRegion) flowRegion.innerHTML = renderFlowBody(log, state);
  } else if (action === "toggle-delay-descriptions") {
    state.showDelayDescriptions = !state.showDelayDescriptions;
    target.classList.toggle("btn-dark", state.showDelayDescriptions);
    target.setAttribute("aria-pressed", String(state.showDelayDescriptions));
    target.title = state.showDelayDescriptions
      ? "Hide textual descriptions"
      : "Show textual descriptions";
    const labelSpan = target.querySelector("span");
    if (labelSpan) {
      labelSpan.textContent = state.showDelayDescriptions
        ? "Hide Descriptions"
        : "Show Descriptions";
    }
    const delayRegion = document.getElementById("delay-dynamic-region");
    if (delayRegion) {
      delayRegion.innerHTML = renderDelayBody(log, state);
    }
  } else if (action === "select-team") {
    state.selectedTeamId = target.dataset.teamId;
    document.querySelectorAll(".team-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.teamId === state.selectedTeamId);
    });
    const activeTeam =
      log.capacity.teams.find((t) => t.id === state.selectedTeamId) || log.capacity.teams[0];
    const chartRegion = document.getElementById("team-chart-region");
    if (chartRegion) {
      chartRegion.innerHTML = renderTeamChartCard(activeTeam, log, state);
    }
  } else if (action === "set-timeline-mode") {
    const nextMode = target.dataset.mode;
    if (nextMode === state.timelineMode) return;
    state.timelineMode = nextMode;
    const modeIdx = Math.max(0, TIMELINE_MODES.indexOf(nextMode));
    const segGlider = document.getElementById("timeline-seg-glider");
    if (segGlider) {
      segGlider.style.transform = `translateX(${modeIdx * 100}%)`;
    }
    document.querySelectorAll(".seg-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === nextMode);
    });
    const cardsRegion = document.getElementById("timeline-cards-region");
    if (cardsRegion) {
      cardsRegion.innerHTML = renderTimelineCardsRegion(log, state);
    }
  } else if (action === "select-timeline-event") {
    state.selectedEventKey = target.dataset.evKey;
    state.selectedEventInfo = {
      label: target.dataset.evLabel,
      meta: target.dataset.evMeta
    };
    const cardsRegion = document.getElementById("timeline-cards-region");
    if (cardsRegion) {
      cardsRegion.innerHTML = renderTimelineCardsRegion(log, state);
    }
  }
});

document.addEventListener("change", (e) => {
  const target = e.target;
  if (!target.dataset) return;

  if (target.dataset.action === "switch-log-dropdown") {
    selectLog(target.value || null);
    syncAppView({ animatePage: true });
  } else if (target.dataset.action === "upload-file-selected") {
    const file = target.files && target.files[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const mappedLogId = lowerName.includes("p2p") ? "ocel2-p2p" : "order-management";
    state.uploadModalOpen = false;
    selectLog(mappedLogId);
    syncAppView({ animatePage: true });
  } else if (target.dataset.action === "select-step-dropdown" && state.logId) {
    const log = getLogPayload(state.logId);
    syncStepAndTeam(log, target.value);
    const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
    const slaInfo = computeStepSlaStatus(step, log, state.slaThresholdDays);
    const metaEl = document.getElementById("delay-meta-text");
    if (metaEl) {
      metaEl.textContent = `${step.volume} · ${slaInfo.affectedValue} affected (> ${state.slaThresholdDays.toFixed(1)}d threshold)`;
    }
    const delayRegion = document.getElementById("delay-dynamic-region");
    if (delayRegion) {
      delayRegion.innerHTML = renderDelayBody(log, state);
    } else {
      renderPage({ animate: false });
    }
  } else if (target.dataset.action === "select-step-in-editor" && state.logId) {
    const prevLog = getLogPayload(state.logId);
    collectAndSaveSchemaForm(prevLog, state.selectedStepId);
    state.selectedStepId = target.value;
    state.schemaEditorTab = "steps";
    syncSidebarUI();
    renderPage({ animate: false });
    syncOverlays();
  }
});

document.addEventListener("input", (e) => {
  const target = e.target;
  if (!target.dataset) return;

  if (target.dataset.action === "change-sla") {
    state.slaThresholdDays = parseFloat(target.value);
    updateSlaAcrossActivePage();
  } else if (target.dataset.action === "change-whatif") {
    state.whatIfReductionPct = parseInt(target.value, 10);
    updateComparisonNumbersInPlace();
  }
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    (state.pageInfoOpen || state.uploadModalOpen || state.schemaEditorOpen)
  ) {
    state.pageInfoOpen = false;
    state.uploadModalOpen = false;
    state.schemaEditorOpen = false;
    syncOverlays();
  }
});

/* ---------- Boot ---------- */
initAppFrame();
applyTheme(state.darkMode, { animate: false });
syncAppView({ animatePage: true });
probePythonBackend().then((status) => {
  state.apiStatus = status;
  syncSidebarUI();
});
