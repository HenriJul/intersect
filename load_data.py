"""Load the SF Fire/EMS OCEL 2.0 dataset.

Usage:
    python load_data.py
"""

from pathlib import Path

import pandas as pd
import pm4py

DATA_PATH = Path(__file__).parent / "data" / "sf-fire-ems-2025-q1.jsonocel"


def load_ocel():
    """Load the dataset as a pm4py OCEL object."""
    return pm4py.read_ocel2_json(str(DATA_PATH))


def events_table(ocel) -> pd.DataFrame:
    """Flat events table (one row per event)."""
    return ocel.events


def objects_table(ocel) -> pd.DataFrame:
    """Flat objects table (one row per object, e.g. call, unit, incident)."""
    return ocel.objects


def relations_table(ocel) -> pd.DataFrame:
    """Event-to-object relationships table."""
    return ocel.relations


def main():
    ocel = load_ocel()

    print(f"Events:    {len(events_table(ocel))}")
    print(f"Objects:   {len(objects_table(ocel))}")
    print(f"Relations: {len(relations_table(ocel))}")

    print("\nObject types:")
    print(objects_table(ocel)["ocel:type"].value_counts())

    print("\nSample events:")
    print(events_table(ocel).head())


if __name__ == "__main__":
    main()
