/**
 * Default Starter View (shown when no event log is selected).
 * Hides the sidebar and displays only the large Intersect brand mark,
 * file selection prompt, Upload Event Log button, and Example Log dropdown.
 */

import { DEMO_LOGS, RAW_DEMO_LOGS } from "../data/demoPayloads.js?v=13";

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
      <div class="starter-content">
        <div class="starter-brand">
          <span class="starter-brand-icon">
            ${renderBrandMarkSvg(31)}
          </span>
          <h1 class="starter-brand-name">Intersect</h1>
        </div>

        <p class="starter-prompt">Select an event log to begin</p>

        <div class="starter-actions">
          <button class="btn btn-dark starter-upload-btn" data-action="open-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Upload Event Log</span>
          </button>

          <div class="starter-divider"><span>or</span></div>

          <div class="starter-select-wrap">
            <select
              id="starter-dataset-select"
              class="starter-select"
              data-action="switch-log-dropdown"
              aria-label="Select an example event log"
            >
              <option value="" selected disabled>Select example event log…</option>
              ${Object.keys(RAW_DEMO_LOGS)
                .map((id) => `<option value="${id}">${DEMO_LOGS[id].title}</option>`)
                .join("")}
            </select>
          </div>
        </div>

        <a
          href="https://github.com/HenriJul/intersect"
          target="_blank"
          rel="noopener noreferrer"
          class="author-credit-link"
          style="margin-top:18px; font-size:12px;"
        >
          Henri Julius
        </a>
      </div>
    </section>
  `;
}
