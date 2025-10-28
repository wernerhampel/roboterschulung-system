'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TeilnehmerModal, { TeilnehmerFormData } from '@/components/TeilnehmerModal';
import SchulungEditModal, { SchulungFormData } from '@/components/SchulungEditModal';
import ZertifikatGeneratorModal from '@/components/ZertifikatGeneratorModal';

interface Schulung {
  id: string;
  titel: string;
  beschreibung?: string;
  typ: string;
  hersteller: string;
  startDatum: string;
  endDatum: string;
  dauer: number;
  maxTeilnehmer: number;
  preis: number;
  status: string;
  ort?: string;
  raum?: string;
  trainer?: string;
  calendarEventId?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    anmeldungen: number;
  };
}

interface Anmeldung {
  id: string;
  status: string;
  anmeldedatum: string;
  bezahlstatus: string;
  teilnehmer: {
    id: string;
    vorname: string;
    nachname: string;
    email: string;
    firma?: string;
    telefon?: string;
  };
}

export default function SchulungDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [schulung, setSchulung] = useState<Schulung | null>(null);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showTeilnehmerModal, setShowTeilnehmerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showZertifikatModal, setShowZertifikatModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadSchulungDetails();
    }
  }, [id]);

  async function loadSchulungDetails() {
    try {
      setLoading(true);
      
      // Schulung laden
      const schulungRes = await fetch(`/api/schulungen/${id}`);
      if (!schulungRes.ok) {
        throw new Error('Schulung nicht gefunden');
      }
      const schulungData = await schulungRes.json();
      setSchulung(schulungData);

      // Anmeldungen laden
      const anmeldungenRes = await fetch(`/api/schulungen/${id}/anmeldungen`);
      if (anmeldungenRes.ok) {
        const anmeldungenData = await anmeldungenRes.json();
        setAnmeldungen(anmeldungenData);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  async function handleTeilnehmerSave(data: TeilnehmerFormData) {
    const response = await fetch(`/api/schulungen/${id}/anmeldungen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teilnehmer: {
          vorname: data.vorname,
          nachname: data.nachname,
          email: data.email,
          telefon: data.telefon,
          firma: data.firma,
          position: data.position,
          strasse: data.strasse,
          plz: data.plz,
          ort: data.ort,
          land: data.land
        },
        status: data.status,
        bezahlstatus: data.bezahlstatus,
        bemerkungen: data.bemerkungen
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Speichern');
    }

    // Reload data
    await loadSchulungDetails();
  }

  async function handleSchulungSave(data: SchulungFormData) {
    const response = await fetch(`/api/schulungen/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Speichern');
    }

    // Reload data
    await loadSchulungDetails();
  }

  async function handleDelete() {
    if (!confirm('Möchten Sie diese Schulung wirklich löschen?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/schulungen/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      // Redirect to list
      router.push('/schulungen');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen');
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      geplant: 'bg-gray-100 text-gray-800',
      bestaetigt: 'bg-blue-100 text-blue-800',
      laufend: 'bg-green-100 text-green-800',
      abgeschlossen: 'bg-purple-100 text-purple-800',
      abgesagt: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.geplant;
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      geplant: 'Geplant',
      bestaetigt: 'Bestätigt',
      laufend: 'Läuft',
      abgeschlossen: 'Abgeschlossen',
      abgesagt: 'Abgesagt'
    };
    return labels[status] || status;
  }

  function getTypLabel(typ: string): string {
    const labels: Record<string, string> = {
      grundlagen: 'Grundlagen',
      praxis: 'Praxis',
      online: 'Online',
      sonstige: 'Sonstige'
    };
    return labels[typ] || typ;
  }

  function getHerstellerLabel(hersteller: string): string {
    const labels: Record<string, string> = {
      kuka: 'KUKA',
      abb: 'ABB',
      mitsubishi: 'Mitsubishi',
      universal_robots: 'Universal Robots',
      sonstige: 'Sonstige'
    };
    return labels[hersteller] || hersteller;
  }

  function getBezahlstatusColor(status: string): string {
    const colors: Record<string, string> = {
      offen: 'bg-yellow-100 text-yellow-800',
      bezahlt: 'bg-green-100 text-green-800',
      erstattet: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.offen;
  }

  function getAnmeldungsstatusColor(status: string): string {
    const colors: Record<string, string> = {
      angemeldet: 'bg-blue-100 text-blue-800',
      bestaetigt: 'bg-green-100 text-green-800',
      teilgenommen: 'bg-purple-100 text-purple-800',
      nicht_erschienen: 'bg-red-100 text-red-800',
      storniert: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.angemeldet;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Lade Details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !schulung) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">❌ {error || 'Schulung nicht gefunden'}</p>
            <Link href="/schulungen" className="text-red-600 hover:text-red-800 mt-4 inline-block">
              ← Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const freePlaetze = schulung.maxTeilnehmer - (schulung._count?.anmeldungen || 0);
  const auslastung = Math.round(((schulung._count?.anmeldungen || 0) / schulung.maxTeilnehmer) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/schulungen"
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
              >
                ← Zurück zur Übersicht
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{schulung.titel}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(schulung.status)}`}>
                  {getStatusLabel(schulung.status)}
                </span>
                {schulung.calendarEventId && (
                  <span className="text-sm text-gray-500">
                    🗓️ Aus Google Calendar
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Bearbeiten
              </button>
              <button 
                onClick={() => setShowTeilnehmerModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Teilnehmer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Teilnehmer</div>
            <div className="text-3xl font-bold text-gray-900">
              {schulung._count?.anmeldungen || 0} / {schulung.maxTeilnehmer}
            </div>
            <div className="text-sm text-gray-500 mt-1">{auslastung}% belegt</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Freie Plätze</div>
            <div className={`text-3xl font-bold ${freePlaetze === 0 ? 'text-red-600' : freePlaetze < 3 ? 'text-orange-600' : 'text-green-600'}`}>
              {freePlaetze}
            </div>
            <div className="text-sm text-gray-500 mt-1">verfügbar</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Dauer</div>
            <div className="text-3xl font-bold text-gray-900">{schulung.dauer}</div>
            <div className="text-sm text-gray-500 mt-1">Tag{schulung.dauer !== 1 ? 'e' : ''}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Preis</div>
            <div className="text-3xl font-bold text-gray-900">
              {schulung.preis > 0 ? `${schulung.preis.toLocaleString('de-DE')} €` : 'Kostenlos'}
            </div>
            <div className="text-sm text-gray-500 mt-1">pro Person</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linke Spalte: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schulungsinformationen */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Schulungsinformationen</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Typ</div>
                  <div className="font-medium">{getTypLabel(schulung.typ)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Hersteller</div>
                  <div className="font-medium">{getHerstellerLabel(schulung.hersteller)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Startdatum</div>
                  <div className="font-medium">{formatDate(schulung.startDatum)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Enddatum</div>
                  <div className="font-medium">{formatDate(schulung.endDatum)}</div>
                </div>

                {schulung.ort && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Ort</div>
                    <div className="font-medium">📍 {schulung.ort}</div>
                  </div>
                )}

                {schulung.raum && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Raum</div>
                    <div className="font-medium">{schulung.raum}</div>
                  </div>
                )}

                {schulung.trainer && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Trainer</div>
                    <div className="font-medium">{schulung.trainer}</div>
                  </div>
                )}
              </div>

              {schulung.beschreibung && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Beschreibung</div>
                  <div className="text-gray-800 whitespace-pre-wrap">{schulung.beschreibung}</div>
                </div>
              )}
            </div>

            {/* Teilnehmerliste */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Teilnehmer ({anmeldungen.length})</h2>
                <button 
                  onClick={() => setShowTeilnehmerModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  + Teilnehmer hinzufügen
                </button>
              </div>

              {anmeldungen.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p>Noch keine Anmeldungen</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bezahlt</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anmeldung</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {anmeldungen.map((anmeldung) => (
                        <tr key={anmeldung.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {anmeldung.teilnehmer.vorname} {anmeldung.teilnehmer.nachname}
                            </div>
                            <div className="text-sm text-gray-500">{anmeldung.teilnehmer.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {anmeldung.teilnehmer.firma || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAnmeldungsstatusColor(anmeldung.status)}`}>
                              {anmeldung.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBezahlstatusColor(anmeldung.bezahlstatus)}`}>
                              {anmeldung.bezahlstatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(anmeldung.anmeldedatum)}
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Rechte Spalte: Aktionen & Meta */}
          <div className="space-y-6">
            {/* Aktionen */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Aktionen</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
                >
                  📝 Schulung bearbeiten
                </button>
                <button 
                  onClick={() => setShowTeilnehmerModal(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left"
                >
                  👥 Teilnehmer hinzufügen
                </button>
                <button 
                  onClick={() => setShowZertifikatModal(true)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-left"
                >
                  🎓 Zertifikat erstellen
                </button>
                <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-left">
                  📧 E-Mail senden
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-left disabled:opacity-50"
                >
                  🗑️ Schulung löschen
                </button>
              </div>
            </div>

            {/* Meta Informationen */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold mb-4">System-Informationen</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">ID</div>
                  <div className="font-mono text-xs text-gray-800 break-all">{schulung.id}</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Erstellt</div>
                  <div className="text-gray-800">{formatDateTime(schulung.createdAt)}</div>
                </div>

                <div>
                  <div className="text-gray-600">Aktualisiert</div>
                  <div className="text-gray-800">{formatDateTime(schulung.updatedAt)}</div>
                </div>

                {schulung.calendarEventId && (
                  <>
                    <div className="pt-3 border-t">
                      <div className="text-gray-600">Calendar Event ID</div>
                      <div className="font-mono text-xs text-gray-800 break-all">{schulung.calendarEventId}</div>
                    </div>
                    
                    {schulung.lastSyncedAt && (
                      <div>
                        <div className="text-gray-600">Letzte Sync</div>
                        <div className="text-gray-800">{formatDateTime(schulung.lastSyncedAt)}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {schulung && (
        <>
          <TeilnehmerModal
            isOpen={showTeilnehmerModal}
            onClose={() => setShowTeilnehmerModal(false)}
            onSave={handleTeilnehmerSave}
            schulungId={id}
          />

          <SchulungEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleSchulungSave}
            schulung={{
              id: schulung.id,
              titel: schulung.titel,
              beschreibung: schulung.beschreibung,
              typ: schulung.typ,
              hersteller: schulung.hersteller,
              startDatum: schulung.startDatum,
              endDatum: schulung.endDatum,
              dauer: schulung.dauer,
              maxTeilnehmer: schulung.maxTeilnehmer,
              preis: schulung.preis,
              status: schulung.status,
              ort: schulung.ort,
              raum: schulung.raum,
              trainer: schulung.trainer
            }}
          />

          <ZertifikatGeneratorModal
            isOpen={showZertifikatModal}
            onClose={() => {
              setShowZertifikatModal(false);
              loadSchulungDetails(); // Reload to update hasZertifikat status
            }}
            schulungId={schulung.id}
            schulungTitel={schulung.titel}
            teilnehmer={anmeldungen.map(a => ({
              id: a.teilnehmer.id,
              vorname: a.teilnehmer.vorname,
              nachname: a.teilnehmer.nachname,
              firma: a.teilnehmer.firma,
              hasZertifikat: false // TODO: Add to API response
            }))}
          />
        </>
      )}
    </div>
  );
}
