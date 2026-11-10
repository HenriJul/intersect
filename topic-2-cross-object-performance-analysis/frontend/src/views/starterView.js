/**
 * Default Starter View (shown when no event log is selected).
 * Hides the sidebar and displays only the large Intersect brand mark,
 * file selection prompt, Upload Event Log button, and Example Log dropdown.
 */

export function renderBrandMarkSvg(px = 22) {
  return `
    <svg width="${px}" height="${px}" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="4" cy="4" r="2.2" fill="currentColor" />
      <circle cx="4" cy="12" r="2.2" fill="currentColor" fill-opacity="0.72" />
      <circle cx="12" cy="8" r="2.5" fill="currentColor" />
      <path d="M5.8 4.8L9.8 7.1M5.8 11.2L9.8 8.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  `;
}

export function renderStarterView() {
  return `
    <section class="starter-screen" aria-label="Select Event Log">
      <div class="starter-content" style="max-width:520px;">
        <div class="starter-brand">
          <span class="starter-brand-icon">
            ${renderBrandMarkSvg(31)}
          </span>
          <h1 class="starter-brand-name">Intersect</h1>
        </div>

        <p class="starter-prompt" style="margin-bottom:8px; font-weight:600; color:var(--text-primary); font-size:16px;">
          Cross-Object Performance &amp; Bottleneck Explorer
        </p>
        <p style="margin:0 0 22px; font-size:13.5px; color:var(--text-secondary); max-width:460px; line-height:1.5;">
          Spot where business workflows stall when orders, items, packages, purchase orders, and invoices must synchronize at shared steps.
        </p>

        <div class="starter-actions">
          <button class="btn btn-dark starter-upload-btn" data-action="open-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Upload Event Log</span>
          </button>

          <div class="starter-divider"><span>or choose an example dataset</span></div>

          <div class="starter-select-wrap">
            <select
              id="starter-dataset-select"
              class="starter-select"
              data-action="switch-log-dropdown"
              aria-label="Select an example event log"
            >
              <option value="" selected disabled>Select example event log…</option>
              <option value="order-management">Order Management (Start Here — 21,008 events)</option>
              <option value="ocel2-p2p">Procure-to-Pay (14,671 events)</option>
            </select>
          </div>
        </div>

        <div class="starter-scenario-grid" aria-label="Guided Diagnostic Scenarios">
          <button type="button" class="starter-scenario-card" data-action="quick-select-log" data-log-id="order-management">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;">
              <span class="badge badge-red">Scenario 1 · Recommended</span>
              <span style="font-size:11.5px; color:var(--text-muted); font-weight:600;">order-management.json</span>
            </div>
            <div style="font-weight:700; font-size:14px; color:var(--text-primary); margin-top:7px;">
              Order Management — Why are packages late?
            </div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:3px; line-height:1.45;">
              Follow an order from placement to delivery: see how 1 out-of-stock item holds 5–6 picked items on the shelf for 3.8 days.
            </div>
          </button>

          <button type="button" class="starter-scenario-card" data-action="quick-select-log" data-log-id="ocel2-p2p">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;">
              <span class="badge badge-amber">Scenario 2 · P2P</span>
              <span style="font-size:11.5px; color:var(--text-muted); font-weight:600;">ocel2-p2p.json</span>
            </div>
            <div style="font-weight:700; font-size:14px; color:var(--text-primary); margin-top:7px;">
              Procure-to-Pay — Why is €1.42M in invoices stalled?
            </div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:3px; line-height:1.45;">
              Trace how delegated PR approvals and 2.5 partial goods receipts per PO create a 5.3-day payment bottleneck.
            </div>
          </button>
        </div>
      </div>
    </section>
  `;
}
