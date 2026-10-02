"""Load the P2P and order-management OCEL datasets for topic 2.

Usage:
    python load_data.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common.ocel_loader import ORDER_MANAGEMENT_PATH, P2P_PATH, load_ocel, summarize


def main():
    print("=== P2P ===")
    summarize(load_ocel(P2P_PATH))

    print("\n=== Order management ===")
    summarize(load_ocel(ORDER_MANAGEMENT_PATH))


if __name__ == "__main__":
    main()
