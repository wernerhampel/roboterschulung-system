#!/bin/bash
# update.sh für Windows (Git Bash)

echo "🚀 ROBTEC Deployment Script"
echo "============================"
echo ""

# Prüfe auf Änderungen
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Keine Änderungen gefunden"
    exit 0
fi

echo "📋 Gefundene Änderungen:"
git status --short
echo ""

# Commit Message
if [ -z "$1" ]; then
    MESSAGE="Update from Windows - $(date '+%Y-%m-%d %H:%M')"
else
    MESSAGE="$1"
fi

echo "💬 Commit Message: $MESSAGE"
echo ""

# Bestätigung
read -p "🤔 Jetzt committen und deployen? (j/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[jJ]$ ]]; then
    echo "❌ Deployment abgebrochen"
    exit 0
fi

# Git Operations
echo "📦 Committe Änderungen..."
git add .
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Commit fehlgeschlagen!"
    exit 1
fi

echo "📤 Pushe zu GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Erfolgreich zu GitHub gepusht!"
    echo "🔄 Vercel baut jetzt automatisch neu..."
    echo "📊 Build Status: https://vercel.com/werner-hampels-projects/robtec-admin"
    echo "🌐 Live Site: https://robtec-admin.vercel.app"
    echo ""
else
    echo ""
    echo "❌ Push fehlgeschlagen!"
    exit 1
fi