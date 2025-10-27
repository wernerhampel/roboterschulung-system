#!/bin/bash

# ROBTEC Training System - Auto Update Script
# Dieses Script entpackt Updates und pusht sie automatisch zu GitHub

echo "🚀 ROBTEC Training System - Auto Update"
echo "========================================"
echo ""

# Farben für schönere Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Fehler: Bitte führe das Script im roboterschulung-system Verzeichnis aus${NC}"
    echo ""
    echo "Gehe zuerst ins Repository:"
    echo "  cd ~/roboterschulung-system"
    echo "  ./update.sh"
    exit 1
fi

echo -e "${BLUE}📂 Repository gefunden!${NC}"
echo ""

# Prüfe ob Update-Archiv vorhanden ist
UPDATE_FILE="$HOME/Downloads/calendar-sync-update.tar.gz"

if [ ! -f "$UPDATE_FILE" ]; then
    echo -e "${YELLOW}⚠️  Update-Datei nicht gefunden in Downloads${NC}"
    echo ""
    echo "Bitte lade zuerst die Datei herunter:"
    echo "  calendar-sync-update.tar.gz"
    echo ""
    echo "Oder gib den Pfad zur Update-Datei an:"
    read -p "Pfad: " CUSTOM_PATH
    
    if [ -f "$CUSTOM_PATH" ]; then
        UPDATE_FILE="$CUSTOM_PATH"
    else
        echo -e "${RED}❌ Datei nicht gefunden: $CUSTOM_PATH${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Update-Datei gefunden!${NC}"
echo ""

# Zeige was im Update enthalten ist
echo -e "${BLUE}📦 Update-Inhalt:${NC}"
tar -tzf "$UPDATE_FILE" | head -10
echo ""

# Frage zur Bestätigung
read -p "Möchtest du das Update installieren? (j/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
    echo -e "${YELLOW}❌ Update abgebrochen${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}📥 Entpacke Update...${NC}"
tar -xzf "$UPDATE_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Fehler beim Entpacken${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Update entpackt!${NC}"
echo ""

# Git Status prüfen
echo -e "${BLUE}📊 Prüfe Änderungen...${NC}"
git status --short

echo ""

# Git add
echo -e "${BLUE}➕ Füge Änderungen hinzu...${NC}"
git add .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git add fehlgeschlagen${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Änderungen hinzugefügt!${NC}"
echo ""

# Commit Message
COMMIT_MSG="Feature: Google Calendar bidirectional sync

- Added calendar-sync.ts for bidirectional sync logic
- Added /sync page for sync UI
- Added /api/sync endpoint
- Import from Google Calendar to Database
- Export from Database to Google Calendar
- Full bidirectional sync option
- Dashboard integration with sync button"

echo -e "${BLUE}💬 Erstelle Commit...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Commit fehlgeschlagen (vielleicht keine Änderungen?)${NC}"
    echo ""
    read -p "Trotzdem fortfahren? (j/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ Commit erstellt!${NC}"
echo ""

# Push zu GitHub
echo -e "${BLUE}🚀 Push zu GitHub...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Push fehlgeschlagen${NC}"
    echo ""
    echo "Mögliche Gründe:"
    echo "  - Keine Internet-Verbindung"
    echo "  - GitHub Credentials fehlen"
    echo "  - Branch stimmt nicht (main vs master)"
    echo ""
    echo "Versuche manuell:"
    echo "  git push origin main"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Erfolgreich zu GitHub gepusht!${NC}"
echo ""

# Vercel Deployment Info
echo -e "${BLUE}🔄 Vercel Deployment...${NC}"
echo ""
echo "Vercel deployt jetzt automatisch dein Update!"
echo ""
echo "Prüfe den Status hier:"
echo "  👉 https://vercel.com/werner-hampels-projects/robtec-admin/deployments"
echo ""
echo "Die neue Sync-Seite findest du nach dem Deployment hier:"
echo "  👉 https://robtec-admin.vercel.app/sync"
echo ""

# Cleanup option
echo ""
read -p "Möchtest du die Update-Datei aus Downloads löschen? (j/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[JjYy]$ ]]; then
    rm "$UPDATE_FILE"
    echo -e "${GREEN}✅ Update-Datei gelöscht!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Update abgeschlossen!${NC}"
echo ""
echo "Nächste Schritte:"
echo "  1. Warte ~2 Minuten auf Vercel Deployment"
echo "  2. Öffne https://robtec-admin.vercel.app/sync"
echo "  3. Teste den Calendar Sync!"
echo ""
