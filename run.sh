#!/bin/bash
# Activate virtual environment and run Flask
cd "$(dirname "$0")"
source myenv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
export PORT=5001
python app.py

