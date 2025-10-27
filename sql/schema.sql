-- ROBTEC Training Management System - Database Schema
-- PostgreSQL Version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHULUNGEN (Trainings)
-- ============================================
CREATE TABLE schulungen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titel VARCHAR(255) NOT NULL,
    beschreibung TEXT,
    typ VARCHAR(50) NOT NULL CHECK (typ IN ('Grundlagen', 'Praxis', 'Online', 'Sonder')),
    hersteller VARCHAR(100) NOT NULL CHECK (hersteller IN ('KUKA', 'ABB', 'Mitsubishi', 'Fanuc', 'Universal Robots', 'Sonstige')),
    dauer_tage INTEGER NOT NULL DEFAULT 5,
    max_teilnehmer INTEGER NOT NULL DEFAULT 6,
    preis_pro_person DECIMAL(10, 2),
    google_calendar_event_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'geplant' CHECK (status IN ('geplant', 'aktiv', 'abgeschlossen', 'abgesagt')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index für häufige Abfragen
CREATE INDEX idx_schulungen_typ ON schulungen(typ);
CREATE INDEX idx_schulungen_hersteller ON schulungen(hersteller);
CREATE INDEX idx_schulungen_status ON schulungen(status);
CREATE INDEX idx_schulungen_calendar ON schulungen(google_calendar_event_id);

-- ============================================
-- TERMINE (Training Dates)
-- ============================================
CREATE TABLE termine (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schulung_id UUID NOT NULL REFERENCES schulungen(id) ON DELETE CASCADE,
    start_datum DATE NOT NULL,
    end_datum DATE NOT NULL,
    start_zeit TIME,
    end_zeit TIME,
    standort VARCHAR(255),
    raum VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'geplant' CHECK (status IN ('geplant', 'bestaetigt', 'abgeschlossen', 'abgesagt')),
    notizen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_datum_reihenfolge CHECK (end_datum >= start_datum)
);

CREATE INDEX idx_termine_schulung ON termine(schulung_id);
CREATE INDEX idx_termine_datum ON termine(start_datum, end_datum);
CREATE INDEX idx_termine_status ON termine(status);

-- ============================================
-- TEILNEHMER (Participants)
-- ============================================
CREATE TABLE teilnehmer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vorname VARCHAR(100) NOT NULL,
    nachname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    firma VARCHAR(255),
    telefon VARCHAR(50),
    notizen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teilnehmer_email ON teilnehmer(email);
CREATE INDEX idx_teilnehmer_firma ON teilnehmer(firma);
CREATE INDEX idx_teilnehmer_name ON teilnehmer(nachname, vorname);

-- ============================================
-- ANMELDUNGEN (Registrations)
-- ============================================
CREATE TABLE anmeldungen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    termin_id UUID NOT NULL REFERENCES termine(id) ON DELETE CASCADE,
    teilnehmer_id UUID NOT NULL REFERENCES teilnehmer(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'angemeldet' CHECK (status IN ('angemeldet', 'bestaetigt', 'teilgenommen', 'abgesagt', 'nicht_erschienen')),
    anmeldedatum TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bezahlt BOOLEAN DEFAULT FALSE,
    bezahldatum DATE,
    notizen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(termin_id, teilnehmer_id)
);

CREATE INDEX idx_anmeldungen_termin ON anmeldungen(termin_id);
CREATE INDEX idx_anmeldungen_teilnehmer ON anmeldungen(teilnehmer_id);
CREATE INDEX idx_anmeldungen_status ON anmeldungen(status);

-- ============================================
-- ZERTIFIKATE (Certificates)
-- ============================================
CREATE TABLE zertifikate (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anmeldung_id UUID NOT NULL REFERENCES anmeldungen(id) ON DELETE CASCADE,
    zertifikat_nummer VARCHAR(50) UNIQUE NOT NULL,
    ausstellungsdatum DATE NOT NULL DEFAULT CURRENT_DATE,
    validierung_hash VARCHAR(255) UNIQUE NOT NULL,
    google_drive_file_id VARCHAR(255),
    google_drive_url TEXT,
    qr_code_data TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'gueltig' CHECK (status IN ('gueltig', 'widerrufen', 'abgelaufen')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zertifikate_nummer ON zertifikate(zertifikat_nummer);
CREATE INDEX idx_zertifikate_hash ON zertifikate(validierung_hash);
CREATE INDEX idx_zertifikate_anmeldung ON zertifikate(anmeldung_id);
CREATE INDEX idx_zertifikate_status ON zertifikate(status);

-- ============================================
-- VALIDIERUNGEN (Certificate Validations)
-- ============================================
CREATE TABLE validierungen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zertifikat_id UUID REFERENCES zertifikate(id) ON DELETE SET NULL,
    validierung_hash VARCHAR(255) NOT NULL,
    erfolg BOOLEAN NOT NULL,
    ip_adresse INET,
    user_agent TEXT,
    zeitstempel TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validierungen_zertifikat ON validierungen(zertifikat_id);
CREATE INDEX idx_validierungen_hash ON validierungen(validierung_hash);
CREATE INDEX idx_validierungen_zeitstempel ON validierungen(zeitstempel);

-- ============================================
-- AUDIT LOG (System Log)
-- ============================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    benutzer VARCHAR(255),
    aktion VARCHAR(100) NOT NULL,
    tabelle VARCHAR(100),
    datensatz_id UUID,
    alte_werte JSONB,
    neue_werte JSONB,
    ip_adresse INET,
    zeitstempel TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_benutzer ON audit_log(benutzer);
CREATE INDEX idx_audit_log_aktion ON audit_log(aktion);
CREATE INDEX idx_audit_log_zeitstempel ON audit_log(zeitstempel);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_schulungen_updated_at BEFORE UPDATE ON schulungen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_termine_updated_at BEFORE UPDATE ON termine
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teilnehmer_updated_at BEFORE UPDATE ON teilnehmer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anmeldungen_updated_at BEFORE UPDATE ON anmeldungen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zertifikate_updated_at BEFORE UPDATE ON zertifikate
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Aktuelle Schulungen mit Terminen
CREATE VIEW v_aktuelle_schulungen AS
SELECT 
    s.id as schulung_id,
    s.titel,
    s.typ,
    s.hersteller,
    t.id as termin_id,
    t.start_datum,
    t.end_datum,
    t.standort,
    COUNT(DISTINCT a.id) as anzahl_anmeldungen,
    s.max_teilnehmer,
    s.max_teilnehmer - COUNT(DISTINCT a.id) as freie_plaetze
FROM schulungen s
JOIN termine t ON s.id = t.schulung_id
LEFT JOIN anmeldungen a ON t.id = a.termin_id AND a.status IN ('angemeldet', 'bestaetigt', 'teilgenommen')
WHERE t.status != 'abgesagt' AND t.start_datum >= CURRENT_DATE
GROUP BY s.id, t.id
ORDER BY t.start_datum;

-- Teilnehmer mit Zertifikaten
CREATE VIEW v_teilnehmer_zertifikate AS
SELECT 
    t.id as teilnehmer_id,
    t.vorname,
    t.nachname,
    t.email,
    t.firma,
    s.titel as schulung_titel,
    ter.start_datum,
    z.zertifikat_nummer,
    z.ausstellungsdatum,
    z.status as zertifikat_status
FROM teilnehmer t
JOIN anmeldungen a ON t.id = a.teilnehmer_id
JOIN termine ter ON a.termin_id = ter.id
JOIN schulungen s ON ter.schulung_id = s.id
LEFT JOIN zertifikate z ON a.id = z.anmeldung_id
WHERE a.status = 'teilgenommen'
ORDER BY z.ausstellungsdatum DESC;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample training types
INSERT INTO schulungen (titel, beschreibung, typ, hersteller, dauer_tage, max_teilnehmer, preis_pro_person) VALUES
('KUKA KRC4 Grundlagen', 'Grundlagenschulung für KUKA Roboter mit KRC4 Steuerung', 'Grundlagen', 'KUKA', 5, 6, 2500.00),
('ABB IRC5 Praxis', 'Praxisorientierte Schulung für ABB IRC5 Roboter', 'Praxis', 'ABB', 3, 4, 1800.00),
('Online Training - Roboterprogrammierung', 'Online-Schulung zur Roboterprogrammierung', 'Online', 'Sonstige', 2, 12, 800.00);

COMMENT ON TABLE schulungen IS 'Schulungskatalog mit allen angebotenen Trainings';
COMMENT ON TABLE termine IS 'Konkrete Termine für Schulungen';
COMMENT ON TABLE teilnehmer IS 'Teilnehmerstammdaten';
COMMENT ON TABLE anmeldungen IS 'Anmeldungen von Teilnehmern zu Terminen';
COMMENT ON TABLE zertifikate IS 'Ausgestellte Zertifikate mit QR-Code-Validierung';
COMMENT ON TABLE validierungen IS 'Log aller Zertifikatsvalidierungen';
COMMENT ON TABLE audit_log IS 'System-Audit-Log für alle Änderungen';
