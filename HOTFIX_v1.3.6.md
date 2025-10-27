# 🔧 Hotfix v1.3.6 - Sync API Route

## Problem:
```
Module '"@/lib/calendar-sync"' has no exported member 'syncFromCalendar'.
```

Die API Route nutzte alte Funktionsnamen, aber calendar-sync.ts exportiert:
- `importFromGoogleCalendar` (NEU)
- `exportToGoogleCalendar` (NEU)

## Lösung:
API Route updated mit den korrekten Import-Namen.

---

## Installation:

```bash
cd ~/roboterschulung-system
tar -xzf ~/Downloads/sync-api-hotfix-v1.3.6.tar.gz
git add .
git commit -m "Hotfix v1.3.6: Sync API Route korrigiert"
git push
```

---

## Was geändert wurde:

**Vorher (alt):**
```typescript
import { syncFromCalendar, syncToCalendar, fullSync } from '@/lib/calendar-sync';
```

**Nachher (neu):**
```typescript
import { importFromGoogleCalendar, exportToGoogleCalendar } from '@/lib/calendar-sync';
```

---

**Das war's!** Nach diesem Fix sollte das Build durchlaufen! ✅
