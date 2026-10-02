"""Shared helper for loading the OCEL 2.0 JSON datasets in datasets/.

Parses the raw OCEL 2.0 JSON directly with the standard library and pandas,
without pm4py, to keep loading fast on the larger datasets (e.g. the ~300 MB
fire/EMS log).
"""

import json
from pathlib import Path

import pandas as pd

DATASETS_DIR = Path(__file__).resolve().parents[1] / "datasets"

P2P_PATH = DATASETS_DIR / "ocel2-p2p.json"
ORDER_MANAGEMENT_PATH = DATASETS_DIR / "order-management.json"
FIRE_EMS_PATH = DATASETS_DIR / "sf-fire-ems-2025-q1.jsonocel"


def load_ocel(path: Path) -> dict:
    """Load an OCEL 2.0 JSON file into its raw dict form."""
    with open(path) as f:
        return json.load(f)


def events_table(ocel: dict) -> pd.DataFrame:
    """Flat events table (one row per event)."""
    rows = []
    for event in ocel["events"]:
        row = {
            "ocel:eid": event["id"],
            "ocel:activity": event["type"],
            "ocel:timestamp": event["time"],
        }
        for attr in event.get("attributes", []):
            row[attr["name"]] = attr["value"]
        rows.append(row)
    return pd.DataFrame(rows)


def objects_table(ocel: dict) -> pd.DataFrame:
    """Flat objects table (one row per object, e.g. call, unit, incident)."""
    rows = []
    for obj in ocel["objects"]:
        row = {"ocel:oid": obj["id"], "ocel:type": obj["type"]}
        for attr in obj.get("attributes", []):
            # Object attributes can change over time; last value in the list wins.
            row[attr["name"]] = attr["value"]
        rows.append(row)
    return pd.DataFrame(rows)


def relations_table(ocel: dict) -> pd.DataFrame:
    """Event-to-object relationships table."""
    rows = [
        {"ocel:eid": event["id"], "ocel:oid": rel["objectId"], "ocel:qualifier": rel.get("qualifier")}
        for event in ocel["events"]
        for rel in event.get("relationships", [])
    ]
    return pd.DataFrame(rows)


def summarize(ocel: dict) -> None:
    """Print a quick overview of an OCEL dict's events/objects/relations."""
    objects = objects_table(ocel)
    print(f"Events:    {len(ocel['events'])}")
    print(f"Objects:   {len(objects)}")
    print(f"Relations: {sum(len(e.get('relationships', [])) for e in ocel['events'])}")
    print("\nObject types:")
    print(objects["ocel:type"].value_counts())
