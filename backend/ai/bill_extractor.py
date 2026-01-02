import os
import base64
import json
import re
import requests
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class BillExtractor:
    UNWANTED_KEYWORDS = ["instructions", "terms", "guidelines", "help", "support", "important"]
    
    @staticmethod
    def get_exchange_rate():
        try:
            url = "https://v6.exchangerate-api.com/v6/0c301cab691bf1fa55cc981e/latest/USD"
            response = requests.get(url, timeout=10)
            data = response.json()
            return data["conversion_rates"]["INR"]
        except Exception as e:
            logger.warning(f"Failed to fetch exchange rate: {str(e)}")
            return 83.0
    
    @staticmethod
    def extract_text_from_image(image_path: str) -> str:
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return ""
        
        try:
            with open(image_path, "rb") as image_file:
                image_data = image_file.read()
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            image_ext = os.path.splitext(image_path)[1].lower()
            mime_type = "image/jpeg"
            if image_ext == ".png":
                mime_type = "image/png"
            elif image_ext in [".jpg", ".jpeg"]:
                mime_type = "image/jpeg"
            
            api_key = current_app.config.get('OPENAI_API_KEY')
            endpoint = current_app.config.get('OPENAI_ENDPOINT')
            
            if not api_key:
                logger.error("OPENAI_API_KEY not configured")
                return ""
            
            if endpoint:
                headers = {
                    "Content-Type": "application/json",
                    "api-key": api_key
                }
                api_url = endpoint
            else:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                model = current_app.config.get('OPENAI_MODEL', 'gpt-4o')
                api_url = f"https://api.openai.com/v1/chat/completions"
            
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
            
            if not endpoint:
                payload["model"] = model
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                logger.error(f"OpenAI Vision API Error: {response.status_code} - {response.text}")
                return ""
            
            response_data = response.json()
            extracted_text = response_data["choices"][0]["message"]["content"].strip()
            
            if any(keyword in extracted_text.lower() for keyword in BillExtractor.UNWANTED_KEYWORDS):
                logger.info("Skipping image with instructional keywords")
                return ""
            
            return extracted_text
            
        except Exception as e:
            logger.error(f"Error extracting text from {image_path}: {str(e)}")
            return ""
    
    @staticmethod
    def process_text_with_openai(text: str) -> dict:
        if not text:
            return {}
        
        usd_to_inr_rate = BillExtractor.get_exchange_rate()
        
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
  - If the bill is in **USD**, convert it to INR using the current exchange rate ({usd_to_inr_rate}).
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

### Bill Text:
{text}

### JSON Output:
"""
        
        try:
            api_key = current_app.config.get('OPENAI_API_KEY')
            endpoint = current_app.config.get('OPENAI_ENDPOINT')
            
            if not api_key:
                logger.error("OPENAI_API_KEY not configured")
                return {}
            
            if endpoint:
                headers = {
                    "Content-Type": "application/json",
                    "api-key": api_key
                }
                api_url = endpoint
            else:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                model = current_app.config.get('OPENAI_MODEL', 'gpt-4o')
                api_url = f"https://api.openai.com/v1/chat/completions"
            
            payload = {
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant that extracts structured data from bills and returns only valid JSON without any explanations or markdown formatting."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            }
            
            if not endpoint:
                payload["model"] = model
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                logger.error(f"OpenAI Chat API Error: {response.status_code} - {response.text}")
                return {}
            
            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"].strip()
            
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))
                else:
                    logger.warning("Failed to parse JSON from OpenAI response")
                    return {}
                    
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}")
            return {}
    
    @staticmethod
    def extract_bill_data(image_path: str) -> dict:
        try:
            extracted_text = BillExtractor.extract_text_from_image(image_path)
            
            if not extracted_text:
                logger.warning(f"No text extracted from {image_path}")
                return {}
            
            structured_data = BillExtractor.process_text_with_openai(extracted_text)
            
            if not structured_data:
                logger.warning(f"No structured data extracted from {image_path}")
                return {}
            
            logger.info(f"Successfully extracted bill data from {image_path}")
            return structured_data
            
        except Exception as e:
            logger.error(f"Error in bill extraction pipeline: {str(e)}", exc_info=True)
            return {}

