/**
 * Decoupled REST API Client (`frontend/src/api/ocelClient.js`).
 *
 * Bridges the pure WebApp frontend and the Python OCEL 2.0 backend (`backend/server.py`).
 * - Attempts non-blocking health/metadata sync with `/api/v1/health` and `/api/v1/logs`.
 * - Falls back seamlessly to `DEMO_LOGS` when running as a standalone static prototype
 *   (e.g. GitHub Pages, static HTTP server, or offline peer review).
 */

import { DEMO_LOGS } from "../data/demoPayloads.js?v=5";

const DEFAULT_API_BASE = "/api/v1";

export async function probePythonBackend(apiBase = DEFAULT_API_BASE) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 900);
    const res = await fetch(`${apiBase}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { connected: false, mode: "Standalone Frontend Demo" };
    const data = await res.json();
    return {
      connected: true,
      mode: "Python REST API Connected",
      service: data.service
    };
  } catch {
    return { connected: false, mode: "Standalone Frontend Demo" };
  }
}

export function getLogPayload(logId) {
  return DEMO_LOGS[logId] || DEMO_LOGS["order-management"];
}
