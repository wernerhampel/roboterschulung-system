#!/bin/bash

# ROBTEC Schulungssystem - Smart Update Script v3.0
# Verwendung: 
#   Automatisch:    ./update.sh  (sucht neueste Dateien)
#   Einzelne Datei: ./update.sh <datei.tsx> <ziel-pfad> "<commit-message>"
#   .tar.gz Paket:  ./update.sh <paket.tar.gz>

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "apps/admin" ]; then
    echo -e "${RED}❌ Fehler: Bitte führe das Script im Root-Verzeichnis des Projekts aus${NC}"
    exit 1
fi

# Funktion: Zeige Banner
show_banner() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}║            🚀 ROBTEC Smart Update Script v3.0 🚀             ║${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Funktion: Finde neueste Dateien
find_recent_files() {
    local downloads_dir="$HOME/Downloads"
    
    if [ ! -d "$downloads_dir" ]; then
        echo -e "${RED}❌ Downloads Verzeichnis nicht gefunden: $downloads_dir${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔍 Suche nach neuen Dateien in ~/Downloads...${NC}"
    echo ""
    
    # Finde Dateien von heute
    local today=$(date +%Y-%m-%d)
    local files=()
    
    # Suche nach relevanten Dateien (modifiziert heute)
    while IFS= read -r file; do
        files+=("$file")
    done < <(find "$downloads_dir" -maxdepth 1 -type f \
        \( -name "*.tar.gz" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
        -newermt "$today" -print | sort -r)
    
    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Keine neuen Dateien von heute gefunden${NC}"
        echo ""
        echo "Suche stattdessen nach den 10 neuesten Dateien..."
        echo ""
        
        # Zeige die 10 neuesten Dateien
        while IFS= read -r file; do
            files+=("$file")
        done < <(find "$downloads_dir" -maxdepth 1 -type f \
            \( -name "*.tar.gz" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
            -print0 | xargs -0 ls -t | head -10)
    fi
    
    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${RED}❌ Keine Dateien gefunden${NC}"
        return 1
    fi
    
    # Zeige Auswahl
    echo -e "${GREEN}📋 Gefundene Dateien:${NC}"
    echo ""
    
    local i=1
    for file in "${files[@]}"; do
        local basename=$(basename "$file")
        local size=$(du -h "$file" | cut -f1)
        local date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d' ' -f1,2 | cut -d. -f1)
        
        # Highlight .tar.gz Pakete
        if [[ "$basename" == *.tar.gz ]]; then
            echo -e "${CYAN}[$i]${NC} 📦 ${GREEN}${basename}${NC} (${size}, ${date})"
        else
            echo -e "${CYAN}[$i]${NC} 📄 ${basename} (${size}, ${date})"
        fi
        i=$((i+1))
    done
    
    echo ""
    echo -e "${CYAN}[0]${NC} ❌ Abbrechen"
    echo ""
    
    # Warte auf Auswahl
    while true; do
        read -p "Welche Datei möchtest du deployen? [0-${#files[@]}]: " choice
        
        if [[ "$choice" == "0" ]]; then
            echo -e "${YELLOW}⚠️  Abgebrochen${NC}"
            exit 0
        fi
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#files[@]}" ]; then
            selected_file="${files[$((choice-1))]}"
            break
        else
            echo -e "${RED}❌ Ungültige Auswahl. Bitte Zahl zwischen 0 und ${#files[@]} eingeben.${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Ausgewählt: $(basename "$selected_file")${NC}"
    echo ""
    
    # Erkenne Dateityp und deploye
    if [[ "$selected_file" == *.tar.gz ]]; then
        deploy_package "$selected_file"
    else
        # Einzelne Datei - frage nach Ziel und Message
        echo -e "${YELLOW}📋 Einzelne Datei erkannt${NC}"
        echo ""
        
        read -p "Ziel-Pfad (z.B. apps/admin/src/lib/file.ts): " target_path
        
        if [ -z "$target_path" ]; then
            echo -e "${RED}❌ Ziel-Pfad erforderlich${NC}"
            exit 1
        fi
        
        read -p "Commit Message: " commit_msg
        
        if [ -z "$commit_msg" ]; then
            echo -e "${RED}❌ Commit Message erforderlich${NC}"
            exit 1
        fi
        
        echo ""
        deploy_single_file "$selected_file" "$target_path" "$commit_msg"
    fi
}

# Funktion: Einzelne Datei deployen
deploy_single_file() {
    local SOURCE_FILE="$1"
    local TARGET_PATH="$2"
    local COMMIT_MSG="$3"

    # Check if source file exists - prüfe mehrere Orte
    if [ ! -f "$SOURCE_FILE" ]; then
        # Versuche in Downloads
        if [ -f "$HOME/Downloads/$SOURCE_FILE" ]; then
            SOURCE_FILE="$HOME/Downloads/$SOURCE_FILE"
            echo -e "${BLUE}💡 Datei gefunden in ~/Downloads/${NC}"
        else
            echo -e "${RED}❌ Fehler: Datei '$SOURCE_FILE' nicht gefunden${NC}"
            echo -e "${YELLOW}Gesucht in:${NC}"
            echo -e "  - Aktuelles Verzeichnis"
            echo -e "  - ~/Downloads/"
            exit 1
        fi
    fi

    echo -e "${BLUE}📦 Deploye einzelne Datei${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Create target directory if it doesn't exist
    TARGET_DIR=$(dirname "$TARGET_PATH")
    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${BLUE}📁 Erstelle Verzeichnis: $TARGET_DIR${NC}"
        mkdir -p "$TARGET_DIR"
    fi

    # Copy file
    echo -e "${BLUE}📋 Kopiere: $(basename "$SOURCE_FILE") → $TARGET_PATH${NC}"
    cp "$SOURCE_FILE" "$TARGET_PATH"

    # Git operations
    echo -e "${BLUE}📝 Git Add...${NC}"
    git add "$TARGET_PATH"

    echo -e "${BLUE}💾 Git Commit...${NC}"
    git commit -m "$COMMIT_MSG"

    echo -e "${BLUE}🚀 Git Push...${NC}"
    git push

    echo ""
    echo -e "${GREEN}✅ Update erfolgreich!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Vercel wird jetzt automatisch deployen...${NC}"
    echo ""
    echo -e "Deployment Status: ${BLUE}https://vercel.com/dashboard${NC}"
}

# Funktion: .tar.gz Paket deployen
deploy_package() {
    local PACKAGE_FILE="$1"

    # Check if package exists
    if [ ! -f "$PACKAGE_FILE" ]; then
        echo -e "${RED}❌ Fehler: Paket '$PACKAGE_FILE' nicht gefunden${NC}"
        exit 1
    fi

    echo -e "${BLUE}📦 Deploye Paket${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Create temp directory
    TEMP_DIR=$(mktemp -d)
    echo -e "${BLUE}📁 Erstelle temporäres Verzeichnis: $TEMP_DIR${NC}"

    # Extract package
    echo -e "${BLUE}📦 Entpacke: $(basename "$PACKAGE_FILE")${NC}"
    tar -xzf "$PACKAGE_FILE" -C "$TEMP_DIR"

    # Check for DEPLOY.txt with deployment instructions
    if [ -f "$TEMP_DIR/DEPLOY.txt" ]; then
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  DEPLOY.txt gefunden:${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        cat "$TEMP_DIR/DEPLOY.txt"
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        read -p "Automatisch deployen? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}⚠️  Deployment abgebrochen${NC}"
            rm -rf "$TEMP_DIR"
            exit 0
        fi
        echo ""
    fi

    # Look for deployment manifest
    if [ -f "$TEMP_DIR/MANIFEST.txt" ]; then
        echo -e "${BLUE}📋 MANIFEST.txt gefunden - deploye Dateien automatisch...${NC}"
        echo ""
        
        local deployed=0
        local skipped=0
        
        while IFS='|' read -r source target; do
            # Skip comments and empty lines
            [[ "$source" =~ ^#.*$ ]] && continue
            [[ -z "$source" ]] && continue
            
            SOURCE_FILE="$TEMP_DIR/$source"
            
            if [ -f "$SOURCE_FILE" ]; then
                TARGET_DIR=$(dirname "$target")
                if [ ! -d "$TARGET_DIR" ]; then
                    echo -e "${BLUE}📁 Erstelle: $TARGET_DIR${NC}"
                    mkdir -p "$TARGET_DIR"
                fi
                
                echo -e "${GREEN}✅${NC} $source → $target"
                cp "$SOURCE_FILE" "$target"
                git add "$target"
                deployed=$((deployed+1))
            else
                echo -e "${YELLOW}⚠️  Überspringe (nicht gefunden): $source${NC}"
                skipped=$((skipped+1))
            fi
        done < "$TEMP_DIR/MANIFEST.txt"
        
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ ${deployed} Dateien deployed${NC}"
        if [ $skipped -gt 0 ]; then
            echo -e "${YELLOW}⚠️  ${skipped} Dateien übersprungen${NC}"
        fi
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
    else
        # No manifest - copy all files recursively (preserving structure)
        echo -e "${YELLOW}⚠️  Kein MANIFEST.txt gefunden${NC}"
        echo -e "${BLUE}📋 Zeige verfügbare Dateien...${NC}"
        echo ""
        
        # Skip documentation files
        local found_files=()
        while IFS= read -r file; do
            # Get relative path
            rel_path="${file#$TEMP_DIR/}"
            found_files+=("$rel_path")
        done < <(find "$TEMP_DIR" -type f ! -name "*.md" ! -name "*.txt" ! -name "README*")
        
        if [ ${#found_files[@]} -eq 0 ]; then
            echo -e "${RED}❌ Keine deploybare Dateien gefunden${NC}"
            rm -rf "$TEMP_DIR"
            exit 1
        fi
        
        for file in "${found_files[@]}"; do
            echo -e "${BLUE}📄${NC} $file"
        done
        
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  Paket ohne MANIFEST.txt${NC}"
        echo -e "${YELLOW}Bitte Dateien manuell deployen:${NC}"
        echo -e "${YELLOW}./update.sh <datei> <ziel> \"<message>\"${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        rm -rf "$TEMP_DIR"
        exit 0
    fi

    # Commit all changes
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  Keine Änderungen zum Committen${NC}"
    else
        PACKAGE_NAME=$(basename "$PACKAGE_FILE" .tar.gz)
        echo -e "${BLUE}💾 Git Commit...${NC}"
        git commit -m "Deploy: $PACKAGE_NAME"

        echo -e "${BLUE}🚀 Git Push...${NC}"
        git push
    fi

    # Cleanup
    rm -rf "$TEMP_DIR"

    echo ""
    echo -e "${GREEN}✅ Paket erfolgreich deployed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Vercel wird jetzt automatisch deployen...${NC}"
    echo ""
    echo -e "Deployment Status: ${BLUE}https://vercel.com/dashboard${NC}"
}

# Main logic
show_banner

if [ "$#" -eq 0 ]; then
    # No arguments - auto-detect mode
    find_recent_files
elif [ "$#" -eq 1 ]; then
    # Single argument - check if it's a .tar.gz
    if [[ "$1" == *.tar.gz ]]; then
        deploy_package "$1"
    else
        echo -e "${RED}❌ Fehler: Ungültige Verwendung${NC}"
        echo ""
        echo "Verwendung:"
        echo "  ${GREEN}Automatisch:${NC}    ./update.sh"
        echo "  ${GREEN}Einzelne Datei:${NC} ./update.sh <datei> <ziel> \"<commit-message>\""
        echo "  ${GREEN}Paket:${NC}          ./update.sh <paket.tar.gz>"
        echo ""
        echo "Beispiele:"
        echo "  ./update.sh"
        echo "  ./update.sh Footer.tsx apps/admin/src/components/Footer.tsx \"Add: Footer\""
        echo "  ./update.sh zertifikat-system-v2.0.0.tar.gz"
        exit 1
    fi
elif [ "$#" -eq 3 ]; then
    # Three arguments - single file deployment
    deploy_single_file "$1" "$2" "$3"
else
    echo -e "${RED}❌ Fehler: Falsche Anzahl von Argumenten${NC}"
    echo ""
    echo "Verwendung:"
    echo "  ${GREEN}Automatisch:${NC}    ./update.sh"
    echo "  ${GREEN}Einzelne Datei:${NC} ./update.sh <datei> <ziel> \"<commit-message>\""
    echo "  ${GREEN}Paket:${NC}          ./update.sh <paket.tar.gz>"
    echo ""
    echo "Beispiele:"
    echo "  ./update.sh"
    echo "  ./update.sh Footer.tsx apps/admin/src/components/Footer.tsx \"Add: Footer\""
    echo "  ./update.sh zertifikat-system-v2.0.0.tar.gz"
    exit 1
fi
