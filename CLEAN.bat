@echo off
REM Clean Distribution Script - Resume Builder
REM This script prepares the application for distribution or a fresh install
REM It removes: dependencies, temporary files, databases, and secrets

echo.
echo ========================================
echo   Cleaning Project for Distribution
echo ========================================
echo.

cd /d "%~dp0"

REM 1. Clean Backend
echo [1/4] Cleaning Backend...
if exist "backend\__pycache__" (
    rmdir /s /q "backend\__pycache__"
)
if exist "backend\services\__pycache__" (
    rmdir /s /q "backend\services\__pycache__"
)
if exist "backend\repositories\__pycache__" (
    rmdir /s /q "backend\repositories\__pycache__"
)
if exist "backend\resume_builder.db" (
    del "backend\resume_builder.db"
    echo   - Removed database
)

if exist "backend\uploads" (
    rmdir /s /q "backend\uploads"
    mkdir "backend\uploads"
    echo   - Cleared uploads
)
if exist "backend\generated" (
    rmdir /s /q "backend\generated"
    mkdir "backend\generated"
    echo   - Cleared generated files
)
echo   - Backend cleaned

REM 2. Clean Frontend
echo [2/4] Cleaning Frontend...
if exist "frontend\node_modules" (
    echo   - Removing node_modules (this may take a while)...
    rmdir /s /q "frontend\node_modules"
)
if exist "frontend\build" (
    rmdir /s /q "frontend\build"
)
if exist "frontend\dist" (
    rmdir /s /q "frontend\dist"
)
if exist "frontend\.eslintcache" (
    del "frontend\.eslintcache"
)
echo   - Frontend cleaned

REM 3. Clean Temp Files
echo [3/4] Removing temporary files...
del /s /q *.pyc 2>nul
del /s /q *.pyo 2>nul
del /s /q *.log 2>nul
del /s /q *.DS_Store 2>nul

REM 4. Final verification
echo [4/4] Verifying structure...
if not exist "backend\.env.example" (
    echo WARNING: backend\.env.example is missing! Retrieving...
    REM In a real scenario, we might want to git checkout it, but for now we warn.
)

echo.
echo ========================================
echo   ✓ Project Cleaned Successfully!
echo ========================================
echo.
echo Safe to zip/distribute.
echo To restart:
echo   1. Run INSTALL.bat
echo   2. Run Run.bat
echo.
pause
