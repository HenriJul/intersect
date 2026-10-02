# Software Lab Starter

Starter repo for the Software Lab. Contains the dataset and the Python code
to load it.

## Dataset

`data/sf-fire-ems-2025-q1.jsonocel` — San Francisco Fire/EMS dispatch data for
Q1 2025, in [OCEL 2.0](https://www.ocel-standard.org/) JSON format
(object-centric event log).

- **Event types:** call received/entered, unit dispatched/responded/on scene,
  patient transport started, unit arrived at hospital, unit available.
- **Object types:** `call`, `incident`, `unit`, `station_area`, `battalion`,
  `neighborhood`.

The file is tracked with [Git LFS](https://git-lfs.com) (~300 MB). Install
Git LFS before cloning:

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

```bash
python load_data.py
```

[`load_data.py`](load_data.py) uses [pm4py](https://processintelligence.solutions/pm4py)
to load the OCEL file and exposes three flat tables as pandas DataFrames:

- `events_table(ocel)` — one row per event
- `objects_table(ocel)` — one row per object (call, unit, incident, ...)
- `relations_table(ocel)` — event-to-object relationships

Use these as your starting point for exploration and analysis.
