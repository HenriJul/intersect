/**
 * Minimal Upload Event Log Modal
 */

export function renderUploadModal(isOpen) {
  if (!isOpen) return "";

  return `
    <div class="modal-overlay" data-action="close-modal-backdrop">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div>
          <h2 id="upload-title" style="margin:0; font-size:17.5px; font-weight:700;">Upload Event Log</h2>
        </div>

        <div class="upload-dropzone">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:4px;">
            OCEL 2.0 File (.json, .jsonocel, .sqlite)
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">
            Handled by Python API (<code>POST /api/v1/logs/upload</code>)
          </div>
          <input
            id="ocel-file-input"
            type="file"
            accept=".json,.jsonocel,.sqlite,.xml"
            data-action="upload-file-selected"
            hidden
          />
          <label for="ocel-file-input" class="btn btn-dark" style="cursor:pointer;">
            Select File…
          </label>
        </div>

        <div style="font-size:12px; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
          <span>Prototype maps uploaded files to example OCEL logs</span>
          <button class="btn btn-sm" data-action="close-modal">Cancel</button>
        </div>
      </div>
    </div>
  `;
}
