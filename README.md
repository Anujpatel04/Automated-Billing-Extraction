<!-- Animated Typing Banner -->
<p align="center">
  <a href="https://github.com/Anujpatel04/Automated-Billing-Extraction">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&pause=1000&color=00C4FF&center=true&vCenter=true&width=700&lines=Automated+Billing+Extraction+🧾;OCR+%2B+LLM+Powered+Data+Automation;Extract%2C+Organize+%26+Export+Expense+Bills+Effortlessly" alt="Typing SVG" />
  </a>
</p>

<!-- Project Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Framework-Flask-red?style=flat-square" alt="Framework">
  <img src="https://img.shields.io/badge/OCR-OpenAI_Vision_API-blue?style=flat-square" alt="OCR">
  <img src="https://img.shields.io/badge/LLM-OpenAI-green?style=flat-square" alt="LLM">
  <img src="https://img.shields.io/badge/Export-Excel-yellow?style=flat-square" alt="Export">
  <img src="https://komarev.com/ghpvc/?username=Anujpatel04&label=Repo+Views&color=blueviolet&style=flat-square" alt="Views">
</p>

---

## 💡 Overview
**Automated Billing Extraction** is an AI-powered Flask web application that processes ZIP files of scanned expense bills, extracts structured information using **OpenAI Vision API** for OCR, and organizes the data using **OpenAI GPT models** — finally exporting everything into a clean Excel file.

🎯 **Key Features**
- 📤 Upload ZIP files or PDFs of scanned bills  
- 🧠 Extract vendor, date, amount, and item details via AI-powered OCR  
- 🤖 Use OpenAI LLM for intelligent data organization  
- 📊 Export structured data to Excel with one click  
- 🎨 Professional, modern web interface with drag & drop  
- 📱 Fully responsive design (mobile-friendly)

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Flask (Python)
- **AI Models:** OpenAI GPT-4o-mini / GPT-4 Vision
- **OCR Engine:** OpenAI Vision API
- **Output:** Excel (xlsx)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Anujpatel04/Automated-Billing-Extraction.git
cd Automated-Billing-Extraction
```

2. **Create and activate virtual environment**
```bash
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_VISION_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
```

5. **Run the application**
```bash
./run.sh
# Or manually:
python app.py
```

6. **Access the application**
Open your browser and navigate to: `http://localhost:5001`

> **Note:** Port 5001 is used by default to avoid conflicts with macOS AirPlay Receiver (which uses port 5000). You can change the port by setting the `PORT` environment variable.

---

## 📁 Project Structure

```
Automated-Billing-Extraction/
├── app.py                 # Flask application (main backend)
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css    # Professional styling
│   └── js/
│       └── main.js      # Frontend JavaScript
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (create this)
├── run.sh               # Run script
└── README.md            # This file
```

---

## 🎨 Features

### User Interface
- **Modern Design:** Gradient backgrounds, smooth animations, and professional styling
- **Drag & Drop:** Easy file upload with drag and drop support
- **Real-time Progress:** Visual progress indicators during processing
- **Toast Notifications:** User-friendly feedback messages
- **Responsive Layout:** Works seamlessly on desktop, tablet, and mobile devices

### Functionality
- **Multi-format Support:** Handles ZIP files and PDF documents
- **Automatic Extraction:** Extracts images from PDFs automatically
- **AI-Powered OCR:** Uses OpenAI Vision API for accurate text extraction
- **Smart Categorization:** Automatically categorizes bills as food, flight, or cab
- **Currency Conversion:** Converts USD to INR automatically
- **Excel Export:** One-click download of structured data

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
OPENAI_VISION_MODEL=gpt-4o-mini  # Options: gpt-4o-mini, gpt-4o, gpt-4-vision-preview
```

---

## 📝 Usage

1. **Upload Files:** Drag and drop or click to upload a ZIP file or PDF containing bill images
2. **Wait for Processing:** The application will extract images and process them automatically
3. **View Results:** Review the extracted data in the interactive table
4. **Download Excel:** Click the download button to get your expense report as an Excel file

---

## 🛡️ Supported Bill Types

- **Food Bills:** Restaurant receipts, meal expenses
- **Flight Bills:** Airline tickets, travel expenses
- **Cab Bills:** Ride-sharing receipts, taxi fares

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- OpenAI for providing powerful AI models
- Flask community for the excellent web framework
- All contributors and users of this project

---

**Made with ❤️ using Flask and OpenAI**
