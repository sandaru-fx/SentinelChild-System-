# 🛡️ SentinelChild-System
> **A Comprehensive Child Safety and Monitoring Solution**

[![Development CI](https://github.com/sandaru-fx/SentinelChild-System-/actions/workflows/ci.yml/badge.svg)](https://github.com/sandaru-fx/SentinelChild-System-/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go](https://img.shields.io/badge/Language-Go-blue.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/Framework-React-blue.svg)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-In--Development-green.svg)]()

SentinelChild-System is a robust security and reporting platform designed to empower citizens and protect children through real-time monitoring and rapid incident reporting.

---

## 🚀 Key Features

- **📍 Anonymous reporting:** Submit detailed reports of incidents without revealing your identity.
- **🎙️ Voice Guardian:** AI-powered voice assistant for hands-free and rapid reporting.
- **💬 Real-time Support:** Live chat session with authorized law enforcement officers.
- **🔍 Status Tracking:** Monitor the progress of your reports in real-time.
- **🛡️ Data Privacy:** Automated metadata stripping and encrypted evidence storage.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Go (Golang), Fiber Framework
- **Database:** MongoDB
- **AI Integration:** Google Gemini API
- **Authentication:** Custom JWT / Clerk (Optional)

---

## ⚙️ Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/sandaru-fx/SentinelChild-System-.git
   ```

2. **Install Dependencies:**
   Run the following command in the root directory to install both root and frontend dependencies:
   ```bash
   npm run install:all
   ```

3. **Configure Environment:**
   Create a `.env` file in the root and `backend` directories with the following variables:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `PORT` (Default: 8080)

4. **Run the Application:**
   Start both the backend and frontend concurrently:
   ```bash
   npm run dev
   ```

---

## 👤 Author
Sandaru Chamoda

GitHub: [@sandaru-fx](https://github.com/sandaru-fx)

LinkedIn: [sandaru-jayaweera-329110373](https://www.linkedin.com/in/sandaru-jayaweera-329110373)
