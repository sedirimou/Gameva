#!/bin/bash

# Quick Git Save Script
# Simple one-time commit and push

echo "💾 Git Save - $(date '+%Y-%m-%d %H:%M:%S')"

# Check for changes
if git diff --quiet HEAD 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
    echo "No changes to save"
    exit 0
fi

# Quick commit
git add . && git commit -m "Auto save - $(date '+%Y-%m-%d %H:%M:%S')" && git push

if [ $? -eq 0 ]; then
    echo "✅ Changes saved successfully"
else
    echo "❌ Save failed - check manually"
fi