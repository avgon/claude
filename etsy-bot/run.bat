@echo off
REM Etsy Bot Launcher Script for Windows

echo ==================================
echo       Etsy Bot Launcher
echo ==================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
pip show selenium >nul 2>&1
if errorlevel 1 (
    echo Installing requirements...
    pip install -r requirements.txt
)

REM Check if config files exist
if not exist "config\emails.txt" (
    echo.
    echo WARNING: config\emails.txt not found!
    echo Please add your email:password pairs to config\emails.txt
    echo.
    pause
    exit /b 1
)

if not exist "config\keywords.txt" (
    echo.
    echo WARNING: config\keywords.txt not found!
    echo Please add your keywords to config\keywords.txt
    echo.
    pause
    exit /b 1
)

REM Run the bot
echo.
echo Starting bot...
echo.
python main.py %*

REM Deactivate virtual environment
call venv\Scripts\deactivate.bat

pause
