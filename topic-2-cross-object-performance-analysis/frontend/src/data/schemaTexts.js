/**
 * Schema-Matched Explanations Manager (`frontend/src/data/schemaTexts.js`)
 *
 * Matches event logs by their structural OCEL 2.0 Schema Signature
 * (the combination of tracked object types and shared event types).
 * - Provides default/auto-generated explanations for any OCEL 2.0 dataset.
 * - Persists user-edited plain-language descriptions per schema signature in localStorage
 *   so any future event log sharing the same object & event types automatically inherits them.
 */

const STORAGE_KEY = "intersect-schema-texts-v1";

export function getSchemaSignature(log) {
  if (!log) return "unknown-schema";
  const objTypes = (log.tracks || [])
    .map((t) => t.id)
    .slice()
    .sort()
    .join("+");
  const stepTypes = Object.keys(log.steps || {})
    .slice()
    .sort()
    .join("+");
  return `ocel-schema:${objTypes}::${stepTypes}`;
}

export function getSchemaReadableSummary(log) {
  if (!log) return "";
  const objNames = (log.tracks || []).map((t) => t.label).join(", ");
  const stepCount = Object.keys(log.steps || {}).length;
  return `Object types: ${objNames} · ${stepCount} shared steps`;
}

function loadAllSavedSchemaProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllSavedSchemaProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage quota or privacy-mode errors
  }
}

export function getResolvedStepTexts(log, stepId) {
  const step = log.steps[stepId] || log.steps[log.defaultStepId];
  const signature = getSchemaSignature(log);
  const allProfiles = loadAllSavedSchemaProfiles();
  const custom =
    allProfiles[signature] && allProfiles[signature][step.id]
      ? allProfiles[signature][step.id]
      : null;

  const bd = step.breakdown;

  return {
    isCustomized: Boolean(custom),
    schemaSignature: signature,
    schemaSummary: getSchemaReadableSummary(log),
    summaryText: (custom && custom.summaryText) || step.summaryText,
    allItemsDesc: (custom && custom.allItemsDesc) || bd.allItemsDesc,
    otherObjectsDesc: (custom && custom.otherObjectsDesc) || bd.otherObjectsDesc,
    teamDesc: (custom && custom.teamDesc) || bd.teamDesc,
    delaySourceDescs: step.delaySources.map((src, idx) =>
      custom && Array.isArray(custom.delaySourceDescs) && custom.delaySourceDescs[idx]
        ? custom.delaySourceDescs[idx]
        : src.desc
    ),
    chainDescs: step.chain.map((c, idx) =>
      custom && Array.isArray(custom.chainDescs) && custom.chainDescs[idx]
        ? custom.chainDescs[idx]
        : c.desc
    )
  };
}

export function saveStepSchemaTexts(log, stepId, newTexts) {
  const step = log.steps[stepId] || log.steps[log.defaultStepId];
  const signature = getSchemaSignature(log);
  const allProfiles = loadAllSavedSchemaProfiles();

  if (!allProfiles[signature]) {
    allProfiles[signature] = {};
  }

  allProfiles[signature][step.id] = {
    summaryText: String(newTexts.summaryText || "").trim() || step.summaryText,
    allItemsDesc: String(newTexts.allItemsDesc || "").trim() || step.breakdown.allItemsDesc,
    otherObjectsDesc:
      String(newTexts.otherObjectsDesc || "").trim() || step.breakdown.otherObjectsDesc,
    teamDesc: String(newTexts.teamDesc || "").trim() || step.breakdown.teamDesc,
    delaySourceDescs: step.delaySources.map((src, idx) => {
      const val =
        newTexts.delaySourceDescs && typeof newTexts.delaySourceDescs[idx] === "string"
          ? newTexts.delaySourceDescs[idx].trim()
          : "";
      return val || src.desc;
    }),
    chainDescs: step.chain.map((c, idx) => {
      const val =
        newTexts.chainDescs && typeof newTexts.chainDescs[idx] === "string"
          ? newTexts.chainDescs[idx].trim()
          : "";
      return val || c.desc;
    })
  };

  writeAllSavedSchemaProfiles(allProfiles);
}

export function resetStepSchemaTexts(log, stepId) {
  const step = log.steps[stepId] || log.steps[log.defaultStepId];
  const signature = getSchemaSignature(log);
  const allProfiles = loadAllSavedSchemaProfiles();

  if (allProfiles[signature] && allProfiles[signature][step.id]) {
    delete allProfiles[signature][step.id];
    if (Object.keys(allProfiles[signature]).length === 0) {
      delete allProfiles[signature];
    }
    writeAllSavedSchemaProfiles(allProfiles);
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSchemaTextEditorModal(log, state, isOpen) {
  if (!isOpen || !log) return "";

  const step = log.steps[state.selectedStepId] || log.steps[log.defaultStepId];
  const allSteps = Object.values(log.steps);
  const resolved = getResolvedStepTexts(log, step.id);

  return `
    <div class="modal-overlay" data-action="close-modal-backdrop">
      <div class="modal-box modal-box-wide" role="dialog" aria-modal="true" aria-labelledby="schema-editor-title">
        <div class="schema-modal-header">
          <div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted);">
                Schema-Matched Explanations
              </span>
              <span class="badge ${resolved.isCustomized ? "badge-amber" : "badge-neutral"}">
                ${resolved.isCustomized ? "Customized for Schema" : "Default Schema Text"}
              </span>
            </div>
            <h2 id="schema-editor-title" style="margin:4px 0 0; font-size:19px; font-weight:700; letter-spacing:-0.02em;">
              Edit Explanations — ${escapeHtml(step.name)}
            </h2>
            <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
              Matched to logs with <strong>${escapeHtml(resolved.schemaSummary)}</strong>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <label for="schema-modal-step-select" style="font-size:12px; color:var(--text-muted); font-weight:500;">Step:</label>
            <select id="schema-modal-step-select" class="select-input" data-action="select-step-in-editor">
              ${allSteps
                .map(
                  (s) =>
                    `<option value="${s.id}" ${s.id === step.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`
                )
                .join("")}
            </select>
            <button class="btn btn-sm" data-action="close-modal" aria-label="Close editor">Close</button>
          </div>
        </div>

        <form id="schema-text-editor-form" class="schema-editor-body" onsubmit="return false;">
          <div class="schema-editor-section">
            <label class="schema-field-label" for="field-summary-text">
              Overall Step Delay Explanation ("Why This Step Is Delayed")
            </label>
            <textarea id="field-summary-text" class="schema-textarea" rows="3">${escapeHtml(resolved.summaryText)}</textarea>
          </div>

          <div class="schema-editor-section">
            <div class="schema-section-heading">Wait-Time Bucket Descriptions</div>
            <div class="schema-grid-3">
              <div>
                <label class="schema-field-label" for="field-all-items-desc">
                  <span class="dot amber"></span> Waiting for All Items
                </label>
                <textarea id="field-all-items-desc" class="schema-textarea" rows="3">${escapeHtml(resolved.allItemsDesc)}</textarea>
              </div>

              <div>
                <label class="schema-field-label" for="field-other-objects-desc">
                  <span class="dot blue"></span> Waiting for Other Objects
                </label>
                <textarea id="field-other-objects-desc" class="schema-textarea" rows="3">${escapeHtml(resolved.otherObjectsDesc)}</textarea>
              </div>

              <div>
                <label class="schema-field-label" for="field-team-desc">
                  <span class="dot" style="background:var(--purple);"></span> Waiting for Team
                </label>
                <textarea id="field-team-desc" class="schema-textarea" rows="3">${escapeHtml(resolved.teamDesc)}</textarea>
              </div>
            </div>
          </div>

          <div class="schema-grid-2">
            <div class="schema-editor-section">
              <div class="schema-section-heading">Slowest Incoming Objects</div>
              ${step.delaySources
                .map(
                  (src, idx) => `
                  <div style="margin-top:${idx === 0 ? "0" : "10px"};">
                    <label class="schema-field-label" for="field-source-desc-${idx}">
                      ${escapeHtml(src.label)}
                    </label>
                    <textarea id="field-source-desc-${idx}" data-source-idx="${idx}" class="schema-textarea" rows="2">${escapeHtml(resolved.delaySourceDescs[idx])}</textarea>
                  </div>
                `
                )
                .join("")}
            </div>

            <div class="schema-editor-section">
              <div class="schema-section-heading">Upstream & Downstream Impact</div>
              ${step.chain
                .map(
                  (c, idx) => `
                  <div style="margin-top:${idx === 0 ? "0" : "10px"};">
                    <label class="schema-field-label" for="field-chain-desc-${idx}">
                      ${escapeHtml(c.stage)} — ${escapeHtml(c.name)}
                    </label>
                    <textarea id="field-chain-desc-${idx}" data-chain-idx="${idx}" class="schema-textarea" rows="2">${escapeHtml(resolved.chainDescs[idx])}</textarea>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
        </form>

        <div class="schema-modal-footer">
          <button type="button" class="btn btn-sm" data-action="reset-schema-texts">
            Reset Step to Default
          </button>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn" data-action="close-modal">
              Cancel
            </button>
            <button type="button" class="btn btn-dark" data-action="save-schema-texts">
              Save for This Log Type
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
