# Automated Bill Extraction

AI-powered web application for extracting structured data from expense bills using OpenAI Vision API and GPT models.

## Overview

Automated Bill Extraction processes ZIP files, PDFs, or images containing expense bills, extracts text using OCR, and organizes the data into structured format. The processed data can be exported to Excel format.

## Features

- Upload ZIP files, PDFs, or image files (PNG, JPG, JPEG)
- AI-powered OCR using OpenAI Vision API
- Intelligent data extraction and organization using GPT models
- Support for food, flight, and cab bills
- Export structured data to Excel
- Modern web interface with drag and drop support
- Responsive design

## Tech Stack

- **Backend:** Flask (Python)
- **Frontend:** HTML5, CSS3, JavaScript
- **AI:** OpenAI (GPT-4o)
- **Output:** Excel (xlsx)

## Prerequisites

- Python 3.8 or higher
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Anujpatel04/Automated-Billing-Extraction.git
cd Automated-Billing-Extraction
```

2. Create and activate virtual environment:
```bash
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key
PORT=5001
```

5. Run the application:
```bash
python app.py
```

6. Access the application:
Open your browser and navigate to `http://localhost:5001`

## Project Structure

```

## Usage

1. Upload files using drag and drop or click to select
2. Click "Process Files" to start extraction
3. Review extracted data in the results table
4. Click "Download Excel" to export the data

## Supported Bill Types

- Food bills (restaurant receipts, meal expenses)
- Flight bills (airline tickets, travel expenses)
- Cab bills (ride-sharing receipts, taxi fares)

## Configuration

The application uses environment variables for configuration. Required variables:

- `OPENAI_API_KEY`: OpenAI API key

Optional variables:

- `PORT`: Server port (default: 5001)

## Data Storage

The application stores processed data in memory only. No files are saved to disk after processing. Excel files are generated on-demand when the download button is clicked.

## License

This project is open source and available under the MIT License.
