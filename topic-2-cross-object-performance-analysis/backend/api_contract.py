"""REST API Data Contract between the Python OCEL 2.0 Backend and the WebApp Frontend.

In the full version (M3/M4), any arbitrary OCEL 2.0 log (.json / .jsonocel / .sqlite)
is ingested by the Python analytics engine and serialized into these exact JSON
endpoints consumed by `frontend/src/api/ocelClient.js`.
"""

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class LogSummaryDTO:
    """Metadata summary for an ingested OCEL 2.0 event log."""

    log_id: str
    title: str
    filename: str
    domain_subtitle: str
    event_count: int
    object_count: int
    relation_count: int
    time_span: str
    object_types: list[dict[str, Any]]
    activities: list[str]


@dataclass
class DelayBreakdownDTO:
    """Plain-language decomposition of OPerA cross-object waiting times."""

    counterpart_wait_hours: float  # OPerA: Synchronization time across distinct object types
    bundle_wait_hours: float       # OPerA: Pooling time across multiple instances of same type
    team_queue_hours: float        # OPerA: Post-synchronization resource / queue waiting time
    primary_lever: str             # "alignment" | "capacity"
    executive_takeaway: str


@dataclass
class IntersectionGateDTO:
    """Diagnostic payload for a multi-object convergence point (Intersection Gate)."""

    gate_id: str
    name: str
    rank: int
    instance_count: int
    avg_total_wait_days: float
    stalled_value_eur: int
    participating_types: list[str]
    primary_blocker_label: str
    primary_blocker_share_pct: int
    breakdown: DelayBreakdownDTO
    blockers: list[dict[str, Any]] = field(default_factory=list)
    domino_chain: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
