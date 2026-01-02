# Quick Start Guide

## Option 1: Use Backend venv (Recommended)

The backend already has a working virtual environment:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Option 2: Use myenv (Root level)

If you want to use the `myenv` at root level:

```bash
cd /Users/anuj/Desktop/Automated_Bill_Extraction/Automated-Billing-Extraction
source myenv/bin/activate
cd backend
pip install -r requirements.txt
python app.py
```

## Option 3: Create New venv

If neither works, create a fresh one:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Verify Virtual Environment

After activation, check:
```bash
which python
# Should show: .../venv/bin/python or .../myenv/bin/python

pip list
# Should show installed packages
```

## Run Backend

```bash
cd backend
source venv/bin/activate  # or source ../myenv/bin/activate
python app.py
```

## Run Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

