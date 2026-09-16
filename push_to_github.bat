@echo off
setlocal

echo ========================================================
echo   SMARTGATE AI - Push to GitHub Repository
echo   Target: https://github.com/aaka052007-svg/AAKASH.git
echo ========================================================
echo.

:: Detect git in PATH or MinGit
set "GIT_CMD=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe" (
        set "GIT_CMD=%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe"
    ) else if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    ) else (
        echo Error: Git is not found on your system.
        pause
        exit /b 1
    )
)

cd /d "%~dp0"

echo [1/5] Initializing Git repository...
if not exist ".git" (
    "%GIT_CMD%" init
    "%GIT_CMD%" branch -M main
    "%GIT_CMD%" remote add origin https://github.com/aaka052007-svg/AAKASH.git
)

echo [2/5] Staging files...
"%GIT_CMD%" add .

echo [3/5] Creating commit...
"%GIT_CMD%" commit -m "Initial commit: SMARTGATE AI Campus Entry & Exit Management System"

echo [4/5] Checking remote origin...
"%GIT_CMD%" remote set-url origin https://github.com/aaka052007-svg/AAKASH.git

echo [5/5] Pushing to GitHub (main branch)...
"%GIT_CMD%" push -u origin main

echo.
echo ========================================================
echo   Push process completed!
echo ========================================================
pause
