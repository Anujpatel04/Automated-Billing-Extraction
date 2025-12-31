from flask import Flask, render_template, request, jsonify, send_file
import zipfile
import os
import io
import pymupdf as fitz
import pandas as pd
import requests
import json
import base64
import re
import shutil
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import uuid
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['EXTRACT_FOLDER'] = 'extracted_bills'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Ensure directories exist
for folder in [app.config['UPLOAD_FOLDER'], app.config['EXTRACT_FOLDER'], 'static']:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Azure OpenAI API Configuration
AZURE_OPENAI_API_KEY = os.getenv("GPT_4O_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")

if not AZURE_OPENAI_API_KEY:
    raise ValueError("GPT_4O_API_KEY not found in environment variables. Please add it to your .env file.")

if not AZURE_OPENAI_ENDPOINT:
    raise ValueError("AZURE_OPENAI_ENDPOINT not found in environment variables. Please add it to your .env file.")

# Note: Model name is included in the endpoint URL, no need to specify separately

# Define unwanted keywords to ignore instructional images
UNWANTED_KEYWORDS = ["instructions", "terms", "guidelines", "help", "support", "important"]

# Get exchange rate
def get_exchange_rate():
    try:
        url = "https://v6.exchangerate-api.com/v6/0c301cab691bf1fa55cc981e/latest/USD"
        response = requests.get(url, timeout=10)
        data = response.json()
        return data["conversion_rates"]["INR"]
    except:
        return 83.0  # Fallback rate

USD_TO_INR_RATE = get_exchange_rate()


# Function to extract text from an image using OpenAI Vision API
def extract_text_from_image(image_path):
    if not os.path.exists(image_path):
        return ""

    try:
        # Read image and encode to base64
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Determine image format
        image_ext = os.path.splitext(image_path)[1].lower()
        mime_type = "image/jpeg"
        if image_ext == ".png":
            mime_type = "image/png"
        elif image_ext == ".jpg" or image_ext == ".jpeg":
            mime_type = "image/jpeg"
        
        # Use Azure OpenAI Vision API to extract text from image
        headers = {
            "Content-Type": "application/json",
            "api-key": AZURE_OPENAI_API_KEY
        }
        
        # Note: Model is specified in the endpoint URL, not in payload
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all text from this image. Return only the extracted text without any additional explanations or formatting. Preserve the original layout and structure of the text. Include all numbers, dates, amounts, and any other textual information visible in the image."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.1,
            "max_tokens": 4000
        }
        
        response = requests.post(AZURE_OPENAI_ENDPOINT, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            print(f"Azure OpenAI API Error: {response.status_code} - {response.text}")
            return ""
        
        response_data = response.json()
        extracted_text = response_data["choices"][0]["message"]["content"].strip()
        
        # Skip images that contain unwanted instructional keywords
        if any(keyword in extracted_text.lower() for keyword in UNWANTED_KEYWORDS):
            return ""
        
        return extracted_text
        
    except Exception as e:
        print(f"Error extracting text from {image_path}: {str(e)}")
        return ""


# Function to process extracted text using OpenAI model
def process_text_with_openai(text):
    prompt = f"""Extract structured data from the given bill text with maximum accuracy. 

Return **only** JSON output without explanations. 

### Rules:
- **Date**: Format **DD-MM-YYYY** (e.g., 05-01-2024). Convert formats like DD/MM/YYYY, YYYY-MM-DD, and DD Mon YYYY.
- **Time**: Format **HH:MM** (12-hour, e.g., 03:45).**Exclude AM/PM**.
- **Time (AM/PM)**: Extract **only** "AM" or "PM", else "".
- **Bill Type**: Categorize as **"food"**, **"flight"**, or **"cab"** based on keywords.
- "Currency Name": Extract currency code (e.g., USD, INR, EUR) or infer from symbols (e.g., $ → USD, ₹ → INR). 
  - should **not include** any other number or alphabet other than currency symbol
  - If unavailable, return "".
- "Bill Amount": Extract as **<currency symbol><amount>** (e.g., $25, ₹500). 
  - Include symbol if present; otherwise, return numeric amount only (e.g., 25). 
  - **Do not include any other characters, numbers, or alphabets.**
  - Convert codes like "INR" → "₹", "USD" → "$", "EUR" → "€".  
  - If the symbol is missing or unrecognized, return "".
- **Bill Amount (INR)**:
  - Convert all currency values to INR.
  - If the bill is in **USD**, convert it to INR using the current exchange rate.
  - If already in INR, keep the value as is.
  - If the currency is **not USD or INR**, return "".
- **Details**:
  - "food": **only** Extract restaurant name.**Return only** name nothing else
  - "flight"/"cab": Extract **"From: <location> - To: <location>"**.**Return only** specific address not full address only important one. 
  - If missing, return "".

### Example:
Example Input:
```
Bill: XYZ Restaurant  
Date: January 5, 2024  
Time: 15:45 PM  
Type: Meal  
Amount: 500 INR  
```
Expected JSON Output:
```json
{{
    "Date": "05-01-2024",
    "Time": "03:45",
    "Time (AM/PM)": "PM",
    "Bill Type": "food",
    "Currency Name": "INR",
    "Bill Amount": "₹500",
    "Bill Amount (INR)": "₹500",
    "Details": "XYZ Restaurant"
}}
```

Example Input:
```
Bill: Uber Ride  
Date: 12-02-2024  
Time: 08:30 AM  
Type: Cab Fare  
Amount: $25  
From: Downtown  
To: Airport  
```
Expected JSON Output:
```json
{{
    "Date": "12-02-2024",
    "Time": "08:30",
    "Time (AM/PM)": "AM",
    "Bill Type": "cab",
    "Currency Name": "USD",
    "Bill Amount": "$25",
    "Bill Amount (INR)": "₹{round(25 * USD_TO_INR_RATE, 2)}",
    "Details": "From: Downtown - To: Airport"
}}
```

### Bill Text:
{text}

### JSON Output:
"""

    try:
        # Use Azure OpenAI API for text processing
        headers = {
            "Content-Type": "application/json",
            "api-key": AZURE_OPENAI_API_KEY
        }
        
        # Note: Model is specified in the endpoint URL, not in payload
        payload = {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that extracts structured data from bills and returns only valid JSON without any explanations or markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(AZURE_OPENAI_ENDPOINT, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            print(f"Azure OpenAI API Error: {response.status_code} - {response.text}")
            return {}
        
        response_data = response.json()
        response_text = response_data["choices"][0]["message"]["content"].strip()
        
        # Try to parse JSON directly
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON from the response
            json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            else:
                return {}
                
    except Exception as e:
        print(f"Azure OpenAI API Error: {e}")
        return {}


# Function to extract images from ZIP file
def extract_images_from_zip(zip_path):
    extract_dir = app.config['EXTRACT_FOLDER']
    extracted_images = []
    extracted_pdfs = []

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_dir)

        for file_info in zip_ref.infolist():
            file_path = os.path.join(extract_dir, file_info.filename)

            if file_info.filename.lower().endswith((".png", ".jpg", ".jpeg")):
                extracted_images.append(file_path)
            elif file_info.filename.lower().endswith(".pdf"):
                extracted_pdfs.append(file_path)

    return extracted_images, extracted_pdfs


# Function to extract images from PDF
def extract_images_from_pdf(pdf_path, output_folder="extracted_images"):
    os.makedirs(output_folder, exist_ok=True)
    extracted_files = []

    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        images = page.get_images(full=True)
        for j, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = os.path.join(output_folder, f"page_{i + 1}_img_{j + 1}.{image_ext}")

            with open(image_filename, "wb") as f:
                f.write(image_bytes)

            extracted_files.append(image_filename)

    return extracted_files


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(session_dir, filename)
        file.save(file_path)
        
        # Extract files
        extracted_images = []
        extracted_pdfs = []
        
        # Check if it's an image file
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            # Direct image upload - save it directly
            extracted_images = [file_path]
        elif filename.endswith('.zip'):
            extracted_images, extracted_pdfs = extract_images_from_zip(file_path)
            # Extract images from PDFs found in ZIP
            for pdf in extracted_pdfs:
                extracted_images.extend(extract_images_from_pdf(pdf, os.path.join(session_dir, 'extracted_images')))
        elif filename.endswith('.pdf'):
            extracted_pdfs = [file_path]
            for pdf in extracted_pdfs:
                extracted_images.extend(extract_images_from_pdf(pdf, os.path.join(session_dir, 'extracted_images')))
        else:
            return jsonify({'error': 'Unsupported file type. Please upload ZIP, PDF, or image files (PNG, JPG, JPEG)'}), 400
        
        if not extracted_images:
            return jsonify({'error': 'No valid images found in the file'}), 400
        
        extracted_filenames = [os.path.basename(img) for img in extracted_images]
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'files': extracted_filenames,
            'count': len(extracted_images)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/process', methods=['POST'])
def process_files():
    try:
        data = request.json
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID required'}), 400
        
        session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        extract_dir = app.config['EXTRACT_FOLDER']
        
        # Find all images in the session
        extracted_images = []
        for root, dirs, files in os.walk(session_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    extracted_images.append(os.path.join(root, file))
        
        # Also check extracted_bills folder
        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    extracted_images.append(os.path.join(root, file))
        
        if not extracted_images:
            return jsonify({'error': 'No images found to process'}), 400
        
        extracted_data = []
        
        for image_path in extracted_images:
            extracted_text = extract_text_from_image(image_path)
            if not extracted_text:
                continue
            
            structured_data = process_text_with_openai(extracted_text)
            if structured_data:
                # Process currency
                currency_symbols = {
                    "$": "USD",
                    "₹": "INR",
                    "€": "EUR",
                    "£": "GBP",
                    "¥": "JPY",
                    "₩": "KRW"
                }
                
                bill_amount = structured_data.get("Bill Amount", "")
                currency_symbol = bill_amount[0] if bill_amount and bill_amount[0] in currency_symbols else ""
                structured_data["Currency Name"] = currency_symbols.get(currency_symbol, "")
                structured_data["Bill Amount"] = bill_amount[1:].strip() if currency_symbol else bill_amount
                
                # Format "From - To" for flight or cab bills
                if "Bill Type" in structured_data and structured_data["Bill Type"] in ["flight", "cab"]:
                    details = structured_data.get("Details", "")
                    if "from" in details.lower() and "to" in details.lower():
                        from_to_match = re.search(r"from\s*:\s*(.*?)\s*-\s*to\s*:\s*(.*)", details, re.IGNORECASE)
                        if from_to_match:
                            structured_data["Details"] = f"From: {from_to_match.group(1).strip()} - To: {from_to_match.group(2).strip()}"
                
                extracted_data.append(structured_data)
        
        if not extracted_data:
            return jsonify({'error': 'No structured data extracted'}), 400
        
        # Remove duplicates
        df = pd.DataFrame(extracted_data)
        df.drop_duplicates(inplace=True)
        df.reset_index(drop=True, inplace=True)
        
        # Save processed data as JSON (for later Excel generation on download)
        json_filename = f"processed_data_{session_id}.json"
        json_path = os.path.join(session_dir, json_filename)
        result_data = df.to_dict('records')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        
        # Clean up uploaded images after processing
        try:
            for root, dirs, files in os.walk(session_dir):
                for file in files:
                    if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                        file_path = os.path.join(root, file)
                        os.remove(file_path)
            
            # Also clean up extracted_bills folder
            extract_dir = app.config['EXTRACT_FOLDER']
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)
                os.makedirs(extract_dir, exist_ok=True)
        except Exception as cleanup_error:
            # Log but don't fail if cleanup fails
            print(f"Warning: Error during cleanup: {cleanup_error}")
        
        return jsonify({
            'success': True,
            'data': result_data,
            'session_id': session_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download/<session_id>')
def download_file(session_id):
    try:
        session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        json_filename = f"processed_data_{session_id}.json"
        json_path = os.path.join(session_dir, json_filename)
        
        if not os.path.exists(json_path):
            return jsonify({'error': 'Processed data not found. Please process files first.'}), 404
        
        # Read the processed data
        with open(json_path, 'r', encoding='utf-8') as f:
            result_data = json.load(f)
        
        # Create DataFrame from the data
        df = pd.DataFrame(result_data)
        
        # Generate Excel file on-demand
        excel_filename = f"expense_report_{session_id}.xlsx"
        excel_path = os.path.join(session_dir, excel_filename)
        with pd.ExcelWriter(excel_path, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False)
        
        # Send the file
        response = send_file(excel_path, as_attachment=True, download_name=excel_filename)
        
        # Clean up the Excel file after sending (optional - you can remove this if you want to keep it)
        # The JSON file is kept for potential re-downloads
        try:
            # Schedule cleanup after response is sent
            import threading
            def cleanup_excel():
                import time
                time.sleep(2)  # Wait a bit to ensure file is sent
                if os.path.exists(excel_path):
                    os.remove(excel_path)
            threading.Thread(target=cleanup_excel, daemon=True).start()
        except Exception:
            pass  # Ignore cleanup errors
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/cleanup/<session_id>', methods=['POST'])
def cleanup_session(session_id):
    try:
        session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        if os.path.exists(session_dir):
            shutil.rmtree(session_dir)
        
        extract_dir = app.config['EXTRACT_FOLDER']
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
            os.makedirs(extract_dir, exist_ok=True)
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # Default to 5001 to avoid macOS AirPlay conflict
    app.run(debug=True, host='0.0.0.0', port=port)

