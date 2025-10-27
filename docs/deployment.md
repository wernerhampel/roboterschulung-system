# Deployment-Anleitung

## 🚀 Schritt-für-Schritt Deployment

### 1. Datenbank initialisieren

Das Schema muss einmalig in der Neon-Datenbank ausgeführt werden:

```bash
# Verbinde dich mit deiner Neon-Datenbank
psql "postgresql://[USERNAME]:[PASSWORD]@[HOST]/roboterschulung-db"

# Führe das Schema aus
\i sql/schema.sql

# Prüfe ob Tabellen erstellt wurden
\dt
```

Oder nutze die Neon Console:
1. Gehe zu https://console.neon.tech
2. Wähle deine Datenbank
3. Öffne "SQL Editor"
4. Kopiere den Inhalt von `sql/schema.sql`
5. Führe das Script aus

### 2. Vercel Build Settings konfigurieren

#### Admin Projekt (robtec-admin)

**Project Settings → General:**
- Framework Preset: `Next.js`
- Root Directory: `apps/admin`
- Build Command: `cd ../.. && npm run build:admin`
- Output Directory: `apps/admin/.next`
- Install Command: `npm install`

**Project Settings → Environment Variables:**

Alle Variables sind bereits gesetzt! ✅

Falls du neue hinzufügen musst:
```
VARIABLE_NAME=value
```
Environments: ✓ Production ✓ Preview ✓ Development

#### Verify Projekt (robtec-verify)

**Project Settings → General:**
- Framework Preset: `Next.js`
- Root Directory: `apps/verify`
- Build Command: `cd ../.. && npm run build:verify`
- Output Directory: `apps/verify/.next`
- Install Command: `npm install`

**Environment Variables:** Bereits gesetzt ✅

### 3. Custom Domains einrichten (Optional)

#### Admin Domain: admin.roboterschulung.de

1. Gehe zu robtec-admin → Settings → Domains
2. Klicke "Add Domain"
3. Gib ein: `admin.roboterschulung.de`
4. Vercel zeigt dir die DNS-Einträge

**DNS bei deinem Provider setzen:**
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

#### Verify Domain: verify.roboterschulung.de

1. Gehe zu robtec-verify → Settings → Domains
2. Klicke "Add Domain"
3. Gib ein: `verify.roboterschulung.de`
4. Vercel zeigt dir die DNS-Einträge

**DNS bei deinem Provider setzen:**
```
Type: CNAME
Name: verify
Value: cname.vercel-dns.com
```

**Warte 24-48h** bis DNS propagiert ist.

### 4. Deployment auslösen

**Automatisch:**
Jeder Push zum `main` Branch deployed automatisch:
```bash
git add .
git commit -m "Your message"
git push origin main
```

**Manuell:**
1. Gehe zu Vercel Dashboard
2. Wähle das Projekt
3. Klicke "Redeploy"

### 5. Deployment verifizieren

Nach dem Deployment prüfe:

#### Admin App
- [ ] https://robtec-admin.vercel.app lädt
- [ ] Dashboard zeigt sich korrekt
- [ ] Schulungen-Seite lädt Daten aus DB
- [ ] Keine JavaScript-Fehler in Console

#### Verify App
- [ ] https://robtec-verify.vercel.app lädt
- [ ] Validierungs-Formular ist sichtbar
- [ ] Keine Fehler in Console

## 🔧 Troubleshooting

### Build Fehler

**Fehler:** `MODULE_NOT_FOUND`
```bash
# Lösung: Dependencies neu installieren
cd apps/admin  # oder apps/verify
rm -rf node_modules
npm install
```

**Fehler:** `DATABASE_URL is not defined`
```bash
# Lösung: Environment Variables in Vercel prüfen
# Gehe zu Project Settings → Environment Variables
# Stelle sicher dass DATABASE_URL gesetzt ist
```

### Runtime Fehler

**Fehler:** Google API Fehler
```bash
# Prüfe:
# 1. GOOGLE_PRIVATE_KEY ist korrekt formatiert (mit \n)
# 2. Service Account hat Zugriff auf Calendar/Drive
# 3. APIs sind in Google Cloud aktiviert
```

**Fehler:** Database Connection Failed
```bash
# Prüfe:
# 1. Neon Datenbank ist online
# 2. DATABASE_URL ist korrekt
# 3. Schema wurde importiert
```

### Performance Issues

**Langsame Ladezeiten:**
1. Prüfe Vercel Analytics
2. Optimiere Bilder mit next/image
3. Enable Edge Caching wo möglich

## 📊 Monitoring

### Vercel Analytics

1. Gehe zu Projekt → Analytics
2. Prüfe:
   - Page Load Times
   - Error Rates
   - Traffic Patterns

### Database Monitoring

1. Gehe zu Neon Console
2. Prüfe:
   - Connection Pool Usage
   - Query Performance
   - Storage Usage

## 🔄 Updates & Rollbacks

### Update deployen

```bash
git add .
git commit -m "Feature: XYZ"
git push origin main
```

### Rollback zu vorheriger Version

1. Gehe zu Vercel → Deployments
2. Finde das letzte funktionierende Deployment
3. Klicke auf "..." → "Promote to Production"

## 🔐 Sicherheit

### Production Checklist

- [ ] Alle Environment Variables sind gesetzt
- [ ] NEXTAUTH_SECRET ist stark und unique
- [ ] Google Service Account Keys sind sicher
- [ ] Database Credentials sind sicher
- [ ] HTTPS-Only ist aktiv
- [ ] CORS ist korrekt konfiguriert

### Backup-Strategie

**Datenbank:**
```bash
# Automatisches Backup mit Neon (täglich)
# Oder manuell:
pg_dump "postgresql://..." > backup-$(date +%Y%m%d).sql
```

**Code:**
- Git Repository ist die Source of Truth
- Tags für Releases nutzen:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 📞 Support

Bei Problemen:
1. Prüfe Vercel Logs: Projekt → Deployments → [Latest] → Function Logs
2. Prüfe Neon Logs: Console → Query History
3. Kontakt: hampel@robtec.de

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment:

1. **Test-Daten erstellen**
   - Erste Schulung anlegen
   - Test-Teilnehmer erstellen
   - Test-Zertifikat generieren
   - Validierung testen

2. **Produktiv-Daten migrieren** (falls vorhanden)
   - Export aus altem System
   - Import in neue Datenbank
   - Datenintegrität prüfen

3. **Team schulen**
   - Admin-Interface Demo
   - Prozess-Dokumentation
   - Best Practices

4. **Monitoring einrichten**
   - Error Tracking (optional: Sentry)
   - Uptime Monitoring
   - Performance Monitoring

Viel Erfolg! 🚀
