@echo off
REM Install All Dependencies - Resume Tailorer
REM This script installs both backend and frontend dependencies
REM and will attempt to install Python and Node.js if not present

echo.
echo ========================================
echo   Resume Builder - Dependency Setup
echo ========================================
echo.

REM Check if winget is available for automatic installations
winget --version >nul 2>&1
if %errorlevel% equ 0 (
    set WINGET_AVAILABLE=1
    echo [✓] Windows Package Manager detected
) else (
    set WINGET_AVAILABLE=0
    echo [i] Windows Package Manager not available
)
echo.

REM ==========================================
REM Check and Install Python
REM ==========================================
echo [1/3] Checking Python installation...
echo ========================================
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Python is not installed
    echo.
    if %WINGET_AVAILABLE% equ 1 (
        echo Attempting to install Python automatically...
        winget install Python.Python.3.12 --silent --accept-source-agreements --accept-package-agreements
        if %errorlevel% equ 0 (
            echo [✓] Python installed successfully
            echo Please close and reopen this window for PATH changes to take effect
            echo Then run INSTALL.bat again
            pause
            exit /b 0
        ) else (
            echo ERROR: Automatic installation failed
            goto :MANUAL_PYTHON_INSTALL
        )
    ) else (
        goto :MANUAL_PYTHON_INSTALL
    )
) else (
    python --version
    echo [✓] Python is already installed
)
echo.

REM ==========================================
REM Check and Install pip
REM ==========================================
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: pip is not installed, attempting to install...
    python -m ensurepip --upgrade
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install pip
        echo Please install pip manually: https://pip.pypa.io/en/stable/installation/
        pause
        exit /b 1
    )
)
echo [✓] pip is available
echo.

REM ==========================================
REM Check and Install Node.js
REM ==========================================
echo [2/3] Checking Node.js installation...
echo ========================================
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Node.js/npm is not installed
    echo.
    if %WINGET_AVAILABLE% equ 1 (
        echo Attempting to install Node.js automatically...
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        if %errorlevel% equ 0 (
            echo [✓] Node.js installed successfully
            echo Please close and reopen this window for PATH changes to take effect
            echo Then run INSTALL.bat again
            pause
            exit /b 0
        ) else (
            echo ERROR: Automatic installation failed
            goto :MANUAL_NODE_INSTALL
        )
    ) else (
        goto :MANUAL_NODE_INSTALL
    )
) else (
    echo Node.js version:
    node --version
    echo npm version:
    call npm --version
    echo [✓] Node.js and npm are already installed
)
echo.

REM ==========================================
REM Install Backend Dependencies
REM ==========================================
echo [3/3] Installing Backend Dependencies...
echo ========================================
cd /d "%~dp0backend"
if %errorlevel% neq 0 (
    echo ERROR: Failed to navigate to backend directory
    pause
    exit /b 1
)

REM Check and create .env file if it doesn't exist
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from template...
        copy ".env.example" ".env" >nul
        echo [!] IMPORTANT: Please edit backend\.env and add your API keys
        echo.
    ) else (
        echo WARNING: .env.example not found, creating default .env
        echo LLM_API_KEY=your_api_key_here> .env
        echo [!] IMPORTANT: Please edit backend\.env and add your API keys
        echo.
    )
)

REM Create necessary directories
if not exist "generated" mkdir generated
if not exist "uploads" mkdir uploads

pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
pip install --upgrade google-generativeai

echo [✓] Backend dependencies installed successfully
echo.

REM ==========================================
REM Install Frontend Dependencies
REM ==========================================
echo [Bonus] Installing Frontend Dependencies...
echo ========================================
cd /d "%~dp0frontend"
if %errorlevel% neq 0 (
    echo ERROR: Failed to navigate to frontend directory
    pause
    exit /b 1
)

echo Installing with npm...
call npm install
if %errorlevel% neq 0 (
    echo WARNING: Standard npm install failed, trying with legacy-peer-deps...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo [✓] Frontend dependencies installed successfully
echo.

echo ========================================
echo   ✓ All Dependencies Installed!
echo ========================================
echo.
echo You can now run the application using:
echo   - Run.bat (to start both backend and frontend)
echo.
pause
exit /b 0

REM ==========================================
REM Manual Installation Instructions
REM ==========================================

:MANUAL_PYTHON_INSTALL
echo.
echo ========================================
echo   Manual Python Installation Required
echo ========================================
echo.
echo Please follow these steps:
echo 1. Visit: https://www.python.org/downloads/
echo 2. Download Python 3.10 or newer
echo 3. Run the installer
echo 4. IMPORTANT: Check "Add Python to PATH" during installation
echo 5. After installation, close this window and run INSTALL.bat again
echo.
pause
exit /b 1

:MANUAL_NODE_INSTALL
echo.
echo ========================================
echo   Manual Node.js Installation Required
echo ========================================
echo.
echo Please follow these steps:
echo 1. Visit: https://nodejs.org/
echo 2. Download the LTS (Long Term Support) version
echo 3. Run the installer with default settings
echo 4. After installation, close this window and run INSTALL.bat again
echo.
pause
exit /b 1
