#!/bin/bash

# Auto Git Commit and Push Script
# Runs every 5 minutes to keep the repository updated

echo "🚀 Starting Auto Git Commit System"
echo "📅 Started at $(date '+%Y-%m-%d %H:%M:%S')"
echo "⏰ Commits will happen every 5 minutes"
echo "----------------------------------------"

# Function to safely remove git lock files
clean_git_locks() {
    if [ -f ".git/index.lock" ]; then
        echo "⚠️  Found git lock file, attempting to clean..."
        sleep 2
        return 1
    fi
    return 0
}

# Function to safely execute git commands
safe_git_commit() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Attempt $attempt of $max_attempts"
        
        # Clean any existing locks
        clean_git_locks
        
        # Try to add files
        if timeout 30 git add . 2>/dev/null; then
            echo "✅ Files added successfully"
            
            # Try to commit
            COMMIT_MSG="Auto commit - $(date '+%Y-%m-%d %H:%M:%S')"
            if timeout 30 git commit -m "$COMMIT_MSG" 2>/dev/null; then
                echo "📝 Committed changes at $(date '+%H:%M:%S')"
                
                # Try to push
                if timeout 60 git push 2>/dev/null; then
                    echo "✅ Auto commit and push completed at $(date '+%H:%M:%S')"
                    return 0
                else
                    echo "❌ Push failed at $(date '+%H:%M:%S')"
                    echo "💡 Note: You may need to manually push when you have internet access"
                    return 0
                fi
            else
                echo "⚠️  Commit failed on attempt $attempt"
            fi
        else
            echo "⚠️  Git add failed on attempt $attempt"
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -le $max_attempts ]; then
            echo "⏳ Waiting 10 seconds before retry..."
            sleep 10
        fi
    done
    
    echo "❌ All attempts failed, will try again in 5 minutes"
    return 1
}

# Main loop
while true
do
    echo "🔍 Checking for changes at $(date '+%H:%M:%S')"
    
    # Check if there are any changes to commit
    if git diff --quiet HEAD 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
        echo "⏸️  No changes detected at $(date '+%H:%M:%S')"
    else
        echo "📋 Changes detected, starting commit process..."
        safe_git_commit
    fi
    
    echo "💤 Sleeping for 5 minutes..."
    echo "----------------------------------------"
    
    # Wait for 5 minutes (300 seconds)
    sleep 300
done