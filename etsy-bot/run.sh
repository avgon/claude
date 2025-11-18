#!/bin/bash

# Etsy Bot Launcher Script

echo "=================================="
echo "      Etsy Bot Launcher"
echo "=================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if [ ! -f "venv/lib/python*/site-packages/selenium" ]; then
    echo "Installing requirements..."
    pip install -r requirements.txt
fi

# Check if config files exist
if [ ! -f "config/emails.txt" ] || [ ! -s "config/emails.txt" ]; then
    echo ""
    echo "⚠️  WARNING: config/emails.txt is empty or not found!"
    echo "Please add your email:password pairs to config/emails.txt"
    echo ""
    exit 1
fi

if [ ! -f "config/keywords.txt" ] || [ ! -s "config/keywords.txt" ]; then
    echo ""
    echo "⚠️  WARNING: config/keywords.txt is empty or not found!"
    echo "Please add your keywords to config/keywords.txt"
    echo ""
    exit 1
fi

# Run the bot
echo ""
echo "Starting bot..."
echo ""
python main.py "$@"

# Deactivate virtual environment
deactivate
