#!/bin/bash
# deploy-schulungsdetails.sh - SUPER EINFACH
# Kopiert die 3 Dateien und deployt

echo "🚀 Schulungsdetails Deployment"
echo "=============================="
echo ""

# Prüfe ob Dateien in Downloads existieren
DOWNLOADS=~/Downloads

echo "🔍 Suche Dateien in Downloads..."
echo ""

FILES_FOUND=0

if [ -f "$DOWNLOADS/page.tsx" ]; then
    echo "✅ page.tsx gefunden"
    FILES_FOUND=$((FILES_FOUND + 1))
fi

if [ -f "$DOWNLOADS/utils.ts" ]; then
    echo "✅ utils.ts gefunden"
    FILES_FOUND=$((FILES_FOUND + 1))
fi

if [ -f "$DOWNLOADS/not-found.tsx" ]; then
    echo "✅ not-found.tsx gefunden"
    FILES_FOUND=$((FILES_FOUND + 1))
fi

echo ""

if [ $FILES_FOUND -eq 0 ]; then
    echo "❌ Keine Dateien gefunden!"
    echo ""
    echo "Bitte lade diese Dateien herunter:"
    echo "  - page.tsx"
    echo "  - utils.ts"
    echo "  - not-found.tsx"
    exit 1
fi

echo "📦 $FILES_FOUND von 3 Dateien gefunden"
echo ""
read -p "🤔 Dateien kopieren und deployen? (j/n) " -n 1 -r
echo ""
echo ""

if [[ ! $REPLY =~ ^[jJ]$ ]]; then
    echo "❌ Abgebrochen"
    exit 0
fi

# Erstelle Verzeichnisse
echo "📁 Erstelle Verzeichnisse..."
mkdir -p "apps/admin/src/app/schulungen/[id]"
mkdir -p "apps/admin/src/lib"

# Kopiere Dateien
echo ""
echo "📂 Kopiere Dateien..."

if [ -f "$DOWNLOADS/page.tsx" ]; then
    cp "$DOWNLOADS/page.tsx" "apps/admin/src/app/schulungen/[id]/page.tsx"
    echo "  ✅ page.tsx → apps/admin/src/app/schulungen/[id]/"
fi

if [ -f "$DOWNLOADS/utils.ts" ]; then
    cp "$DOWNLOADS/utils.ts" "apps/admin/src/lib/utils.ts"
    echo "  ✅ utils.ts → apps/admin/src/lib/"
fi

if [ -f "$DOWNLOADS/not-found.tsx" ]; then
    cp "$DOWNLOADS/not-found.tsx" "apps/admin/src/app/schulungen/[id]/not-found.tsx"
    echo "  ✅ not-found.tsx → apps/admin/src/app/schulungen/[id]/"
fi

echo ""
echo "✅ Dateien kopiert!"
echo ""

# Git Operations
echo "📦 Git Commit..."
git add .
git commit -m "Schulungsdetailseite mit Inhalten erweitert"

echo ""
echo "📤 Pushe zu GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Erfolgreich deployed!"
    echo "🔄 Vercel baut jetzt automatisch..."
    echo "🌐 https://robtec-admin.vercel.app"
    echo ""
    
    read -p "🗑️  Dateien aus Downloads löschen? (j/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[jJ]$ ]]; then
        rm -f "$DOWNLOADS/page.tsx" "$DOWNLOADS/utils.ts" "$DOWNLOADS/not-found.tsx"
        echo "✅ Dateien gelöscht"
    fi
else
    echo ""
    echo "❌ Push fehlgeschlagen!"
    exit 1
fi
