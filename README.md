# Software Lab Starter

Starter repo for the Software Lab. Contains the datasets and the Python code
to load them, organized by seminar topic.

## Structure

```
datasets/                                    all OCEL 2.0 JSON datasets
ocel_common/ocel_loader.py                   shared loading helper
topic-1-streaming-events/                    uses ocel2-p2p + order-management
topic-2-cross-object-performance-analysis/   uses ocel2-p2p + order-management
topic-3-geo-process-exploration/             uses sf-fire-ems-2025-q1
```

Each `topic-*/` folder has its own `load_data.py` and `README.md`.

## Datasets

All three datasets are in [OCEL 2.0](https://www.ocel-standard.org/) JSON
format (object-centric event log), under [`datasets/`](datasets):

- `ocel2-p2p.json` — procure-to-pay process. Used by topic 1 and topic 2.
- `order-management.json` — order management process. Used by topic 1 and topic 2.
- `sf-fire-ems-2025-q1.jsonocel` — San Francisco Fire/EMS dispatch data for
  Q1 2025. Used by topic 3.

`sf-fire-ems-2025-q1.jsonocel` (~300 MB) is tracked with
[Git LFS](https://git-lfs.com). Install Git LFS before cloning:

```bash
git lfs install
git clone https://github.com/PADS-Celonis-Praktika/software-lab-starter.git
```

If you already cloned without LFS set up, run `git lfs pull` inside the repo.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Loading the data

From your topic's folder:

```bash
cd topic-1-streaming-events   # or topic-2-..., topic-3-...
python load_data.py
```

Each `load_data.py` uses [`ocel_common/ocel_loader.py`](ocel_common/ocel_loader.py),
which wraps [pm4py](https://processintelligence.solutions/pm4py)'s OCEL 2.0
JSON reader. `load_ocel(path)` returns a pm4py OCEL object exposing three
flat pandas DataFrames:

- `ocel.events` — one row per event
- `ocel.objects` — one row per object
- `ocel.relations` — event-to-object relationships

Use these as your starting point for exploration and analysis.
