# Entwickler-Notizen - Schulungsliste

## Komponenten-Architektur

### SchulungenPage (`/schulungen/page.tsx`)

**Client Component** mit folgenden Features:
- State Management für Schulungen, Filter, Loading
- useEffect Hooks für Daten laden und Filterung
- Responsive Tabellen-Layout
- Filterbare und durchsuchbare Liste

### API Route (`/api/schulungen/route.ts`)

**Endpoints:**
- `GET` - Alle Schulungen mit Anmeldungszahlen
- `POST` - Neue Schulung erstellen

**Prisma Include:**
```typescript
include: {
  _count: {
    select: {
      anmeldungen: true
    }
  }
}
```

## Filter-Logik

Die Filter sind kombinierbar und arbeiten additiv:
1. Suchbegriff filtert Titel + Ort
2. Typ filtert exakt
3. Hersteller filtert exakt
4. Status filtert exakt

Alle Filter können zurückgesetzt werden.

## Performance-Überlegungen

- Alle Schulungen werden einmal geladen
- Filter arbeiten client-side auf dem geladenen Array
- Keine zusätzlichen API Calls bei Filter-Änderung
- Für >1000 Schulungen: Server-side Pagination erwägen

## Styling

- Tailwind CSS für alle Styles
- Responsive Grid für Statistiken (md:grid-cols-4)
- Hover-Effekte für bessere UX
- Status-Colors als Record für Wartbarkeit

## Erweiterbarkeit

### Neue Filter hinzufügen:
1. State Variable: `const [filterX, setFilterX] = useState('alle')`
2. UI Element in Filter Section
3. Filter-Logik in `applyFilters()`
4. Reset-Button erweitern

### Neue Spalten hinzufügen:
1. Interface `Schulung` erweitern
2. `<th>` im thead hinzufügen
3. `<td>` im tbody hinzufügen
4. API Route anpassen falls nötig

## Testing Checklist

- [ ] Laden von 0 Schulungen (Empty State)
- [ ] Laden mit Fehler (Error State)
- [ ] Filter einzeln testen
- [ ] Filter kombiniert testen
- [ ] Reset Filter
- [ ] Responsive auf Mobile
- [ ] Lange Schulungsnamen
- [ ] Viele Schulungen (Performance)
