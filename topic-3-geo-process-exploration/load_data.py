"""Load the SF Fire/EMS OCEL dataset for topic 3.

Usage:
    python load_data.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ocel_common.ocel_loader import FIRE_EMS_PATH, load_ocel, summarize


def main():
    summarize(load_ocel(FIRE_EMS_PATH))


if __name__ == "__main__":
    main()
