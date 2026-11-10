/**
 * Decoupled REST API Client (`frontend/src/api/ocelClient.js`).
 *
 * Bridges the pure WebApp frontend and the Python OCEL 2.0 backend (`backend/server.py`).
 * - Attempts non-blocking health/metadata sync with `/api/v1/health` and `/api/v1/logs`.
 * - Falls back seamlessly to `DEMO_LOGS` when running as a standalone static prototype
 *   (e.g. GitHub Pages, static HTTP server, or offline peer review).
 */

import { DEMO_LOGS } from "../data/demoPayloads.js?v=9";

const DEFAULT_API_BASE = "/api/v1";

export async function probePythonBackend(apiBase = DEFAULT_API_BASE) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 900);
    const res = await fetch(`${apiBase}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      return {
        connected: false,
        mode: "Static Demo · Precomputed OCEL Metrics",
        liveLogs: null
      };
    }
    const data = await res.json();
    let liveLogs = null;
    try {
      const logsRes = await fetch(`${apiBase}/logs`);
      if (logsRes.ok) {
        const logsPayload = await logsRes.json();
        liveLogs = logsPayload.logs || null;
      }
    } catch {
      // Optional metadata enrichment
    }
    return {
      connected: true,
      mode: "Backend Reachable · Precomputed Metrics",
      service: data.service,
      liveLogs
    };
  } catch {
    return {
      connected: false,
      mode: "Static Demo · Precomputed OCEL Metrics",
      liveLogs: null
    };
  }
}

export function getLogPayload(logId) {
  return DEMO_LOGS[logId] || DEMO_LOGS["order-management"];
}
