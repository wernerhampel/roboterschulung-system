#!/bin/bash

# ROBTEC Schulungssystem - Update Script v3.3
# Einfach und Windows-kompatibel

# Projekt-Pfad
PROJECT_DIR="$HOME/PROJEKTE/roboterschulung-system"
DOWNLOADS_DIR="$HOME/Downloads"

clear
echo "================================================================"
echo "     ROBTEC Schulungssystem - Update Script v3.3"
echo "================================================================"
echo ""

# Prüfe Projekt-Verzeichnis
if [ ! -d "$PROJECT_DIR" ]; then
    echo "FEHLER: Projekt nicht gefunden: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Suche TAR-Dateien
echo "Suche nach TAR-Archiven in Downloads..."
echo ""

# Erstelle Liste der Archive
ARCHIVE_LIST=()
while IFS= read -r file; do
    if [ -f "$file" ]; then
        ARCHIVE_LIST+=("$file")
    fi
done < <(ls -1t "$DOWNLOADS_DIR"/*.tar.gz 2>/dev/null)

# Prüfe ob Archive gefunden wurden
if [ ${#ARCHIVE_LIST[@]} -eq 0 ]; then
    echo "FEHLER: Keine .tar.gz Dateien in Downloads gefunden!"
    echo ""
    echo "Bitte speichere deine Update-Datei in:"
    echo "  $DOWNLOADS_DIR"
    echo ""
    exit 1
fi

# Zeige gefundene Archive
echo "=== Gefundene Archive ==="
echo ""

for i in "${!ARCHIVE_LIST[@]}"; do
    num=$((i + 1))
    file="${ARCHIVE_LIST[$i]}"
    name=$(basename "$file")
    size=$(du -h "$file" | cut -f1)
    echo "  [$num] $name ($size)"
done

echo ""
echo "  [0] Abbrechen"
echo ""

# User-Auswahl
while true; do
    read -p "Welches Archiv verwenden? [0-${#ARCHIVE_LIST[@]}]: " choice
    
    if [ "$choice" = "0" ]; then
        echo "Abgebrochen."
        exit 0
    fi
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#ARCHIVE_LIST[@]}" ]; then
        SELECTED="${ARCHIVE_LIST[$((choice - 1))]}"
        break
    fi
    
    echo "Ungueltige Eingabe!"
done

echo ""
echo "Gewaehltes Archiv: $(basename "$SELECTED")"
echo ""

# Analysiere Archiv
echo "=== Analysiere Archiv ==="
echo ""

TEMP_DIR="$HOME/.robtec_temp_$$"
mkdir -p "$TEMP_DIR"

if ! tar -tzf "$SELECTED" > /dev/null 2>&1; then
    echo "FEHLER: Archiv ist beschaedigt oder kein gueltiges TAR!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Liste Inhalt
echo "Inhalt des Archivs:"
tar -tzf "$SELECTED" | sed 's/^/  /'
echo ""

# Extrahiere
echo "=== Extrahiere Dateien ==="
echo ""

if ! tar -xzf "$SELECTED" -C "$TEMP_DIR" 2>&1; then
    echo "FEHLER: Konnte Archiv nicht extrahieren!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "OK: Archiv extrahiert"
echo ""

# Zeige was kopiert wird
echo "=== Kopiere Dateien ==="
echo ""

COPIED=0
cd "$TEMP_DIR"

for file in $(find . -type f); do
    # Entferne ./ am Anfang
    rel_path="${file#./}"
    
    # Ziel im Projekt
    target="$PROJECT_DIR/apps/admin/$rel_path"
    target_dir=$(dirname "$target")
    
    # Erstelle Verzeichnis
    mkdir -p "$target_dir"
    
    # Kopiere Datei
    if cp "$file" "$target"; then
        echo "  OK: $rel_path"
        ((COPIED++))
    else
        echo "  FEHLER: $rel_path"
    fi
done

cd "$PROJECT_DIR"
rm -rf "$TEMP_DIR"

echo ""
echo "OK: $COPIED Dateien kopiert"
echo ""

# Git Status
echo "=== Git Status ==="
echo ""

if [ -z "$(git status --porcelain)" ]; then
    echo "Keine Aenderungen gefunden!"
    exit 0
fi

git status --short
echo ""

# Commit Message
echo "Commit-Nachricht:"
read -p "Eingabe (Enter = Standard): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(basename "$SELECTED" .tar.gz)"
fi

echo ""

# Bestätigung
echo "================================================================"
echo "                   DEPLOYMENT BESTAETIGUNG"
echo "================================================================"
echo ""
echo "Folgende Aktionen werden ausgefuehrt:"
echo ""
echo "  1. Git Add + Commit: $COMMIT_MSG"
echo "  2. Push zu GitHub"
echo "  3. Vercel baut automatisch (3-5 Min)"
echo "  4. Archiv wird aus Downloads geloescht"
echo ""
echo "Live-URL: https://robtec-admin.vercel.app"
echo ""

read -p "Fortfahren? [j/N]: " CONFIRM

if [[ ! "$CONFIRM" =~ ^[jJyY]$ ]]; then
    echo "Abgebrochen."
    exit 0
fi

echo ""
echo "=== Deployment ==="
echo ""

# Git Workflow
echo "1/3: Git Add..."
git add .

echo "2/3: Git Commit..."
git commit -m "$COMMIT_MSG"

echo "3/3: Git Push..."
if git push origin main; then
    echo ""
    echo "OK: Push erfolgreich!"
    echo ""
    
    # Lösche Archiv
    echo "=== Cleanup ==="
    rm "$SELECTED"
    echo "OK: Archiv geloescht"
    echo ""
    
    echo "================================================================"
    echo "               DEPLOYMENT ERFOLGREICH!"
    echo "================================================================"
    echo ""
    echo "Naechste Schritte:"
    echo "  1. Warte 3-5 Minuten"
    echo "  2. Oeffne: https://robtec-admin.vercel.app"
    echo "  3. Teste die Aenderungen"
    echo ""
else
    echo ""
    echo "FEHLER: Push fehlgeschlagen!"
    exit 1
fi