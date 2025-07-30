#!/bin/bash
# Start D01 Ring Input Capture using Hammerspoon

echo "🔬 Starting D01 Ring Input Capture"
echo "This will monitor all input events to detect D01 button presses"
echo ""

# Check if Hammerspoon is installed
if ! command -v hs &> /dev/null; then
    echo "❌ Hammerspoon not found!"
    echo "Install with: brew install hammerspoon"
    exit 1
fi

# Clear previous log
LOG_FILE="$HOME/d01_capture.log"
> "$LOG_FILE"

echo "📝 Log file: $LOG_FILE"
echo "🎯 Press buttons on your D01 ring now!"
echo "🛑 Press Cmd+Ctrl+D to stop capture"
echo ""

# Run the Hammerspoon capture script
hs -c "dofile('$(pwd)/d01-simple-capture.lua')"

echo ""
echo "📊 Analyzing captured events..."

# Show recent events
if [ -f "$LOG_FILE" ]; then
    echo "Recent events captured:"
    tail -10 "$LOG_FILE" | while read line; do
        echo "  $line"
    done
else
    echo "No events captured"
fi