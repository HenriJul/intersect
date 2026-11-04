"""Lightweight, zero-dependency Python REST API stub & dev server for Topic 2.

Architecture Note:
- `backend/` is strictly separated from `frontend/` and exposes JSON endpoints under `/api/v1/*`.
- Uses `ocel_common/ocel_loader.py` from the starter repository to inspect the real OCEL 2.0
  files (`order-management.json` and `ocel2-p2p.json`) when queried.
- For convenience during Milestone 1 peer review, running `python3 backend/server.py` also
  serves the static `frontend/` single-page application on http://localhost:8080 while
  exposing the decoupled `/api/v1/*` REST endpoints with CORS enabled.
"""

from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sys
from urllib.parse import urlparse

TOPIC_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = TOPIC_DIR.parents[0]
FRONTEND_DIR = TOPIC_DIR / "frontend"

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ocel_common.ocel_loader import (  # noqa: E402
    ORDER_MANAGEMENT_PATH,
    P2P_PATH,
    load_ocel,
    objects_table,
)

_SUMMARY_CACHE: dict[str, dict] = {}


def _build_live_log_summary(log_id: str, path: Path, title: str) -> dict:
    """Compute live structural metadata from an OCEL 2.0 JSON dataset."""
    if log_id in _SUMMARY_CACHE:
        return _SUMMARY_CACHE[log_id]

    if not path.exists():
        return {"log_id": log_id, "title": title, "available": False}

    ocel = load_ocel(path)
    objs = objects_table(ocel)
    type_counts = objs["ocel:type"].value_counts().to_dict()
    relation_count = sum(len(e.get("relationships", [])) for e in ocel.get("events", []))

    summary = {
        "log_id": log_id,
        "title": title,
        "filename": path.name,
        "available": True,
        "event_count": len(ocel.get("events", [])),
        "object_count": len(objs),
        "relation_count": relation_count,
        "object_type_counts": type_counts,
        "activity_types": [et["name"] for et in ocel.get("eventTypes", [])],
    }
    _SUMMARY_CACHE[log_id] = summary
    return summary


class DecoupledOCELApiHandler(SimpleHTTPRequestHandler):
    """Serves `/api/v1/*` JSON endpoints and static `frontend/` assets."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _send_json(self, payload: dict, status: int = 200) -> None:
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        route = parsed.path.rstrip("/")

        if route == "/api/v1/health":
            self._send_json(
                {
                    "status": "ok",
                    "service": "intersect-ocel-python-backend",
                    "mode": "m1-prototype",
                    "generic_ocel_engine": "planned-m3-sprint1",
                }
            )
            return

        if route == "/api/v1/logs":
            self._send_json(
                {
                    "logs": [
                        _build_live_log_summary(
                            "order-management",
                            ORDER_MANAGEMENT_PATH,
                            "Order Management",
                        ),
                        _build_live_log_summary(
                            "ocel2-p2p",
                            P2P_PATH,
                            "Procure-to-Pay (P2P)",
                        ),
                    ]
                }
            )
            return

        if route.startswith("/api/v1/logs/"):
            log_id = route.split("/api/v1/logs/", 1)[1].split("/")[0]
            if log_id == "order-management":
                self._send_json(
                    _build_live_log_summary(
                        "order-management", ORDER_MANAGEMENT_PATH, "Order Management"
                    )
                )
                return
            if log_id == "ocel2-p2p":
                self._send_json(
                    _build_live_log_summary(
                        "ocel2-p2p", P2P_PATH, "Procure-to-Pay (P2P)"
                    )
                )
                return
            self._send_json({"error": f"Unknown OCEL log '{log_id}'"}, status=404)
            return

        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path.rstrip("/") == "/api/v1/logs/upload":
            self._send_json(
                {
                    "status": "prototype_stub",
                    "message": (
                        "Generic OCEL 2.0 ingestion endpoint reserved for Sprint 1/2. "
                        "M1 prototype showcases full workflow on order-management.json and ocel2-p2p.json."
                    ),
                },
                status=202,
            )
            return
        self._send_json({"error": "Not found"}, status=404)


def run(port: int = 8080) -> None:
    server = ThreadingHTTPServer(("127.0.0.1", port), DecoupledOCELApiHandler)
    print(f"Intersect Prototype running at http://localhost:{port}")
    print(f"  Frontend WebApp : http://localhost:{port}/")
    print(f"  Python REST API : http://localhost:{port}/api/v1/health")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run(port=port_arg)
