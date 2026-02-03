# Resume Builder (AI-Powered)

An intelligent resume builder that helps you create and tailor resumes for specific job applications using AI-powered document parsing and analysis.

## 🚀 Quick Start (3 Simple Steps)

1. **Double-click `INSTALL.bat`** - Installs everything you need automatically
2. **Double-click `Run.bat`** - Starts the application
3. **Open your browser** - Visit http://localhost:3000

That's it! The installer handles all dependencies and setup.

## 📋 Table of Contents

- [Quick Start](#-quick-start-3-simple-steps)
- [What You Need](#-what-you-need)
- [Installation Guide](#-installation-guide)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)

## 💻 What You Need

**The installer will help you set these up if you don't have them:**

### Required (will be installed automatically):
- **Python 3.10+** - Backend processing
- **Node.js 16+** - Frontend application

## 📦 Installation Guide

### Option 1: Automatic Installation (Recommended)

1. **Extract the package** to your desired location
2. **Run `INSTALL.bat`** by double-clicking it
3. **Configure your environment** (see Configuration section)

The installer will:
- ✅ Detect or install Python and Node.js
- ✅ Install all Python dependencies (FastAPI, aiosqlite, etc.)
- ✅ Install all Node.js dependencies (React, Tailwind, etc.)
- ✅ Create necessary directories and configuration files

### Option 2: Manual Installation

If you prefer manual setup:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your settings
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps --force
npm install ajv ajv-keywords --legacy-peer-deps
```

## ⚙️ Configuration

### 1. Environment Variables

### 1. Environment Variables

After running INSTALL.bat, the `backend\.env` file should be created automatically from `.env.example`.
If not, copy `.env.example` to `.env` manually.

Edit `backend\.env` to add your API key:

```env
# LLM API Key (Required for AI features)
# Get from: https://makersuite.google.com/app/apikey (Gemini)
# or https://platform.openai.com/api-keys (OpenAI)
LLM_API_KEY=your_api_key_here
```

**Important:** You must replace `your_api_key_here` with your actual API key for the AI features to work.

## 🏃 Running the Application

1. **Double-click `Run.bat`**
2. Wait for both servers to start (about 10-30 seconds)
3. Browser opens automatically at http://localhost:3000

## 📁 Project Structure

```
Resume Builder_Lean/
├── backend/                          # FastAPI backend server
│   ├── .env                         # Environment variables
│   ├── config.py                    # Configuration settings
│   ├── database.py                  # Database connection logic
│   ├── models.py                    # Data models
│   ├── server.py                    # Main FastAPI application
│   ├── requirements.txt             # Python dependencies
│   ├── repositories/                # Data access layer
│   └── services/                    # Business logic
│       ├── document_parser.py       # Parse uploaded resumes
│       ├── llm_service.py           # LLM service wrapper
│       └── resume_generator.py      # AI resume generation
│
├── frontend/                        # React frontend
│   ├── public/
│   └── src/
│
├── INSTALL.bat                      # 🔧 Run this first!
├── Run.bat                          # ▶️ Start the application
└── README.md                        # 📖 You are here
```

## ✨ Features

- ✅ **AI-Powered Resume Analysis** - Parse and understand your existing resumes
- ✅ **Job Application Tracking** - Manage all your job applications in one place
- ✅ **Smart Resume Tailoring** - Automatically customize resumes for specific jobs
- ✅ **Document Upload** - Support for PDF and DOCX formats
- ✅ **Zero Config Database** - Uses SQLite for instant setup

## 🔧 Troubleshooting

**"Python is not recognized"**
- Solution: Run INSTALL.bat again - it will install Python for you

**"Node.js/npm is not recognized"**
- Solution: Run INSTALL.bat again - it will install Node.js for you

**"Failed to install frontend dependencies"**
- This is normal! INSTALL.bat handles this automatically
- It uses special flags: `--legacy-peer-deps --force`
