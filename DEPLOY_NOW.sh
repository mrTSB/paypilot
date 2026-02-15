#!/bin/bash
# DEPLOY_NOW.sh - Run this script to deploy PayPilot to Vercel
#
# This script will:
# 1. Push to GitHub (you need to be authenticated)
# 2. Vercel will auto-deploy from the push

echo "🚀 Deploying PayPilot..."
echo ""

# Check if git remote is set up correctly
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    echo "❌ No git remote configured. Setting up..."
    git remote add origin https://github.com/treehacks50/paypilot.git
fi

echo "📦 Current commits to deploy:"
git log --oneline -5
echo ""

# Try to push
echo "📤 Pushing to GitHub..."
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push successful! Vercel will auto-deploy."
    echo ""
    echo "📍 Your app will be live at: https://paypilot-one.vercel.app"
    echo ""
    echo "Pages that will be available:"
    echo "  - /terms (Terms of Service)"
    echo "  - /privacy (Privacy Policy)"
    echo "  - /login (with Google OAuth button)"
    echo "  - /signup (with Google OAuth button)"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "  1. Run: gh auth login"
    echo "  2. Or manually push: git push origin master"
    echo ""
    echo "If the repo doesn't exist, create it first:"
    echo "  gh repo create treehacks50/paypilot --public --source=. --push"
fi
