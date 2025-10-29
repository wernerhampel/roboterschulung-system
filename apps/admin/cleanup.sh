#!/bin/bash
# Cleanup Script - Entfernt alte Test-Verzeichnisse

echo "Entferne alte Verzeichnisse..."

# Entferne schulungsdetails-update wenn vorhanden
if [ -d "schulungsdetails-update" ]; then
    echo "Lösche schulungsdetails-update..."
    rm -rf schulungsdetails-update
    echo "✓ Gelöscht"
else
    echo "schulungsdetails-update existiert nicht"
fi

echo "Cleanup abgeschlossen!"
