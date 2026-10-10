# Digital Archaeologist

**Tagline:** Dig through the chaos. Discover the structure.
**Category:** AI for Automation — intelligent digital file organization.

## 🚀 Overview
Digital Archaeologist is a premium developer tool built for EvoHacks 2026. It takes chaotic, unstructured folders of downloads and documents, detects exact cryptographic duplicates, and uses AI to recommend a logical, structured folder taxonomy based on the *actual content* of the files.

## 🛠 Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, Multer, Zod
- **Core Engine:** Node Native Crypto (SHA-256 Hashing), PDF-Parse
- **AI Integration:** Google Gemini 1.5 Flash (Strict JSON Schema validation)

## ✨ Core Features
1. **Deterministic Hashing:** Automatically flags identical files using exact SHA-256 streams, ignoring filenames.
2. **AI Folder Architect:** Reads extracted text from TXT, MD, CSV, JSON, and PDF files to group files logically.
3. **Mission Control:** A secure review dashboard to approve/reject AI actions before finalizing.
4. **Export Plan:** Generates an actionable CSV cleanup plan for the user.
5. **Zero-Destruction Guarantee:** The app operates on metadata and safe extraction. It never automatically deletes your original files.

## ⚙️ Setup Instructions
1. Clone this repository.
2. Inside `/server`, create a `.env` file with `AI_API_KEY=your_gemini_key`.
3. Open two terminals:
   - Terminal 1: `cd server && npm run dev`
   - Terminal 2: `cd client && npm run dev`
4. Open `http://localhost:5173`. Click **Load Sample Data** to instantly test the AI and UI without uploading files.
