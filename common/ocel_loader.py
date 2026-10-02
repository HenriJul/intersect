"""Shared helper for loading the OCEL 2.0 JSON datasets in datasets/."""

from pathlib import Path

import pm4py

DATASETS_DIR = Path(__file__).resolve().parents[1] / "datasets"

P2P_PATH = DATASETS_DIR / "ocel2-p2p.json"
ORDER_MANAGEMENT_PATH = DATASETS_DIR / "order-management.json"
FIRE_EMS_PATH = DATASETS_DIR / "sf-fire-ems-2025-q1.jsonocel"


def load_ocel(path: Path):
    """Load an OCEL 2.0 JSON file into a pm4py OCEL object."""
    return pm4py.read_ocel2_json(str(path))


def summarize(ocel) -> None:
    """Print a quick overview of an OCEL object's events/objects/relations."""
    print(f"Events:    {len(ocel.events)}")
    print(f"Objects:   {len(ocel.objects)}")
    print(f"Relations: {len(ocel.relations)}")
    print("\nObject types:")
    print(ocel.objects["ocel:type"].value_counts())
