# 🧾 Intelligent Bill & Ticket Data Extractor (IBN)

## 📌 Overview
**IBN (Intelligent Bill Normalizer)** is an AI-powered application designed to automatically extract, structure, and standardize data from **bills, tickets, and receipts** uploaded in **PDF**, **image**, or **ZIP** formats.  
The system integrates **Google Vision OCR**, **LLM-based data structuring**, and a **Currency Exchange API** to produce consistent, machine-readable data suitable for reporting and analysis.

---

## ⚙️ Features
- 🧠 **OCR-Powered Text Extraction** – Utilizes **Google Vision API** to accurately extract text from scanned or digital bills and receipts.  
- 🤖 **LLM-Based Structuring** – Processes the raw OCR text using an **LLM** (via LangChain or Hugging Face) to clean, organize, and format data into **structured JSON**.  
- 💱 **Currency Normalization** – Integrates a **real-time Currency Exchange API** to unify all extracted prices under a single target currency (e.g., USD).  
- 📦 **Multi-Format Uploads** – Accepts **PDFs**, **images (JPG/PNG)**, and **ZIP archives** containing multiple documents.  
- 📊 **Exportable Data** – Outputs neatly structured **JSON** or tabular data ready for Excel/CSV export.  

---

## 🧩 Tech Stack
| Component | Technology |
|------------|-------------|
| **OCR** | Google Vision API |
| **LLM Processing** | LangChain / Hugging Face |
| **Programming Language** | Python |
| **APIs** | Currency Exchange API |
| **Libraries** | Pandas, Requests, JSON, Google Cloud Vision, LangChain |
| **Deployment** | Streamlit / FastAPI (optional) |

---

## 🚀 Workflow
1. **Upload Documents**
   - User uploads **PDFs**, **images**, or a **ZIP** file containing multiple bills/tickets.  
2. **Text Extraction**
   - The **Google Vision OCR** engine extracts raw text from each document.  
3. **Data Structuring**
   - The text is passed to an **LLM** that identifies key fields (e.g., vendor, date, total amount, tax, currency) and converts them into **structured JSON**.  
4. **Currency Conversion**
   - The system converts all monetary values into a **single target currency** using a live **exchange rate API**.  
5. **Final Output**
   - Clean and consistent data is displayed and available for **download** in JSON or Excel formats.  

---

## 📂 Example Output
```json
{
  "vendor": "Delta Airlines",
  "date": "2025-05-12",
  "items": [
    {"description": "Flight Ticket", "amount": 520.00, "currency": "USD"}
  ],
  "total": 520.00,
  "converted_currency": "USD",
  "converted_total": 520.00
}
```

---

## 🧠 Use Cases
- Automated expense reporting  
- Receipt and bill data management  
- Financial normalization for multi-currency systems  
- Preprocessing for accounting or audit pipelines  

---

## 💡 Future Enhancements
- Integrate **automatic category detection** (e.g., travel, food, utilities)  
- Enable **email ingestion** for automated receipt parsing  
- Develop an **interactive dashboard** for expense visualization and analytics  
- Add **database integration** for long-term storage and querying  

---

## 👨‍💻 Author
**Anuj Patel**  
AI & ML Enthusiast | Data Science | Deep Learning | NLP | LLMs  
🔗 [LinkedIn](https://www.linkedin.com/in/anujpatel) • [GitHub](https://github.com/anujpatel)

---
