# Quick Start Guide for New Users

## 📦 What You Received

This is the **Resume Builder** - an AI-powered application to help you create and manage job applications.

**Package Size:** ~0.8 MB (compact!)  
**After Installation:** ~500-600 MB (includes all dependencies)

---

## 🚀 Getting Started (3 Easy Steps)

### Step 1: Install Everything (5-15 minutes)
Double-click **`INSTALL.bat`**

This will automatically:
- ✅ Check if Python is installed (install if needed)
- ✅ Check if Node.js is installed (install if needed)
- ✅ Check if MongoDB is installed (install if needed)
- ✅ Install all required packages
- ✅ Set up the application and start MongoDB service

**First Time?** If you don't have Python or Node.js:
- The installer will help you install them
- Or provide download links with instructions
- After installing, just run INSTALL.bat again

### Step 2: Configure Your Settings (1 minute - Optional)
The installer automatically configures everything! But you can customize if needed:

1. Open `backend\.env` in any text editor (Notepad works fine)
2. If you want to change anything:

```env
# MongoDB - Keep as is (local) or update to use MongoDB Atlas:
MONGO_URL=mongodb://localhost:27017                          # Default: local MongoDB
# MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/    # Or use MongoDB Atlas

DB_NAME=resume_builder                    # Database name

# Optional - Add your LLM API key if you have one:
LLM_API_KEY=your_api_key_here
```

**About MongoDB:**
- ✅ If local MongoDB installed: Already running and ready to use
- 🌐 If using MongoDB Atlas: Copy your connection string and update MONGO_URL

### Step 3: Run the Application
Double-click **`Run.bat`**

- Two windows will open (backend and frontend)
- Keep both windows open while using the app
- Your browser will open automatically to http://localhost:3000
- **Done! Start using the app 🎉**

---

## 🛑 Stopping the Application

To stop the app:
- Press `Ctrl+C` in both terminal windows, OR
- Simply close both terminal windows

---

## 📁 What's Inside?

```
Resume Builder_Lean/
├── INSTALL.bat       ← Run this first
├── Run.bat          ← Run this to start the app
├── CLEAN.bat        ← Clean temporary files
├── README.md        ← Full documentation
├── backend/         ← Python server code
└── frontend/        ← React web interface
```

---

## ❓ Common Questions

**Q: Do I need to be online?**  
A: Only during installation and if using cloud MongoDB. After setup, can run offline with local MongoDB.

**Q: How do I update the application?**  
A: Get the new version, run CLEAN.bat on old version, then run INSTALL.bat on new version.

**Q: Can I delete node_modules to save space?**  
A: Yes! Run CLEAN.bat, then run INSTALL.bat again when you need to use it.

**Q: Where is my data stored?**  
A: In MongoDB database specified in backend\.env

**Q: Is my data safe?**  
A: All data is stored locally on your computer (if using local MongoDB) or in your own MongoDB Atlas account.

---

## 🔧 Need Help?

1. **Check README.md** - Detailed documentation with troubleshooting
2. **Error Messages** - Read them carefully, they usually explain the issue
3. **Common Issues**:
   - "Cannot connect to MongoDB" → Make sure MongoDB is running
   - "Port already in use" → Close other apps or restart your computer
   - Missing dependencies → Run INSTALL.bat again

---

## 🎯 Quick Commands

| Action | Command |
|--------|---------|
| **Fresh Install** | INSTALL.bat |
| **Start App** | Run.bat |
| **Stop App** | Ctrl+C or close windows |
| **Clean Package** | CLEAN.bat |
| **Reinstall** | CLEAN.bat → INSTALL.bat |

---

## ✅ System Requirements

**Minimum:**
- Windows 10 or newer
- 4 GB RAM
- 1 GB free disk space
- Internet connection (for installation only)

**Recommended:**
- 8 GB RAM
- 2 GB free disk space
- SSD for better performance

---

**Ready to start?** → Run **INSTALL.bat** → Configure **backend\.env** → Run **Run.bat**

**Enjoy using Resume Builder! 🎉**
