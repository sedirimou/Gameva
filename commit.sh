#!/bin/bash

# Manual Git Commit Script
# Run this script manually to commit and push changes

echo "🔍 Checking for changes..."

# Check if there are any changes to commit
if git diff --quiet HEAD 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
    echo "⏸️  No changes detected"
    echo "✅ Repository is up to date"
    exit 0
fi

echo "📋 Changes detected:"
git status --porcelain

# Add all changes
echo "📦 Adding all changes..."
git add .

# Create commit with timestamp
COMMIT_MSG="Manual commit - $(date '+%Y-%m-%d %H:%M:%S')"
echo "📝 Committing with message: $COMMIT_MSG"

# Commit the changes
if git commit -m "$COMMIT_MSG"; then
    echo "✅ Changes committed successfully"
    
    # Push to remote repository
    echo "🚀 Pushing to remote repository..."
    if git push; then
        echo "✅ Successfully pushed to remote repository"
        echo "🎉 All changes have been saved and uploaded"
    else
        echo "❌ Push failed"
        echo "💡 Your changes are committed locally but not pushed to remote"
        echo "💡 Try running 'git push' manually when you have internet access"
    fi
else
    echo "❌ Commit failed"
    echo "💡 Check for any Git errors above"
fi