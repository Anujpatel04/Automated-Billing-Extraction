# How to Use Virtual Environment

## Activate Virtual Environment

### On macOS/Linux:
```bash
cd backend
source venv/bin/activate
```

### On Windows:
```bash
cd backend
venv\Scripts\activate
```

## Verify Activation

After activation, you should see `(venv)` in your terminal prompt:
```bash
(venv) user@computer:~/backend$
```

## Check Python Location

```bash
which python
# Should show: .../backend/venv/bin/python
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run the Application

```bash
python app.py
```

## Deactivate

When done, deactivate the virtual environment:
```bash
deactivate
```

## Troubleshooting

If venv doesn't work, recreate it:
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

