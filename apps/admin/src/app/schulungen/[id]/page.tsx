'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TeilnehmerModal, { TeilnehmerFormData } from '@/components/TeilnehmerModal';
import SchulungEditModal, { SchulungFormData } from '@/components/SchulungEditModal';
import ZertifikatGeneratorModal from '@/components/ZertifikatGeneratorModal';

// DEBUG: Version Info
const DEBUG_VERSION = "1.4.2-debug";
const DEBUG_TIMESTAMP = new Date().toISOString();

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

  // DEBUG: Log component mount
  useEffect(() => {
    console.log('🔍 DEBUG: SchulungDetailsPage mounted');
    console.log('📌 Version:', DEBUG_VERSION);
    console.log('⏰ Timestamp:', DEBUG_TIMESTAMP);
    console.log('🆔 Schulung ID:', id);
    console.log('📦 Modal States:', {
      showTeilnehmerModal,
      showEditModal,
      showZertifikatModal
    });
  }, []);

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('📊 DEBUG: State Update', {
      showZertifikatModal,
      anmeldungenCount: anmeldungen.length,
      schulungLoaded: !!schulung
    });
  }, [showZertifikatModal, anmeldungen, schulung]);

  useEffect(() => {
    if (id) {
      loadSchulungDetails();
    }
  }, [id]);

  async function loadSchulungDetails() {
    try {
      console.log('🔄 DEBUG: Loading Schulung Details...');
      setLoading(true);
      
      // Schulung laden
      const schulungRes = await fetch(`/api/schulungen/${id}`);
      console.log('📡 DEBUG: Schulung Response Status:', schulungRes.status);
      
      if (!schulungRes.ok) {
        throw new Error('Schulung nicht gefunden');
      }
      const schulungData = await schulungRes.json();
      console.log('✅ DEBUG: Schulung loaded:', schulungData);
      setSchulung(schulungData);

      // Anmeldungen laden
      const anmeldungenRes = await fetch(`/api/schulungen/${id}/anmeldungen`);
      console.log('📡 DEBUG: Anmeldungen Response Status:', anmeldungenRes.status);
      
      if (anmeldungenRes.ok) {
        const anmeldungenData = await anmeldungenRes.json();
        console.log('✅ DEBUG: Anmeldungen loaded:', anmeldungenData.length, 'items');
        setAnmeldungen(anmeldungenData);
      }

      setError(null);
    } catch (err) {
      console.error('❌ DEBUG: Error loading details:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  async function handleTeilnehmerSave(data: TeilnehmerFormData) {
    console.log('💾 DEBUG: Saving Teilnehmer...', data);
    const response = await fetch(`/api/schulungen/${id}/anmeldungen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('✅ DEBUG: Teilnehmer saved successfully');
      await loadSchulungDetails();
      setShowTeilnehmerModal(false);
    } else {
      console.error('❌ DEBUG: Failed to save Teilnehmer');
    }
  }

  async function handleSchulungSave(data: SchulungFormData) {
    console.log('💾 DEBUG: Saving Schulung...', data);
    try {
      setActionLoading(true);
      const response = await fetch(`/api/schulungen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('✅ DEBUG: Schulung saved successfully');
        await loadSchulungDetails();
        setShowEditModal(false);
      } else {
        console.error('❌ DEBUG: Failed to save Schulung');
      }
    } catch (error) {
      console.error('❌ DEBUG: Error saving schulung:', error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Möchten Sie diese Schulung wirklich löschen?')) return;
    
    console.log('🗑️ DEBUG: Deleting Schulung...');
    try {
      setActionLoading(true);
      const response = await fetch(`/api/schulungen/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ DEBUG: Schulung deleted successfully');
        router.push('/schulungen');
      } else {
        console.error('❌ DEBUG: Failed to delete Schulung');
      }
    } catch (error) {
      console.error('❌ DEBUG: Error deleting schulung:', error);
    } finally {
      setActionLoading(false);
    }
  }

  // DEBUG: Zertifikat Modal Handler
  const handleZertifikatClick = () => {
    console.log('🎓 DEBUG: Zertifikat Button clicked!');
    console.log('Current state:', { showZertifikatModal });
    console.log('Anmeldungen available:', anmeldungen.length);
    
    if (anmeldungen.length === 0) {
      console.warn('⚠️ DEBUG: No Anmeldungen available for certificates');
      alert('Es sind keine Teilnehmer für Zertifikate verfügbar. Bitte fügen Sie zuerst Teilnehmer hinzu.');
      return;
    }
    
    console.log('✅ DEBUG: Opening Zertifikat Modal...');
    setShowZertifikatModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !schulung) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error || 'Schulung nicht gefunden'}
        </div>
        <Link href="/schulungen" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(schulung.startDatum);
  const endDate = new Date(schulung.endDatum);

  // Berechne verschiedene Teilnehmer-Stati
  const angemeldet = anmeldungen.filter(a => a.status === 'angemeldet').length;
  const bestaetigt = anmeldungen.filter(a => a.status === 'bestaetigt').length;
  const teilgenommen = anmeldungen.filter(a => a.status === 'teilgenommen').length;
  const abgesagt = anmeldungen.filter(a => a.status === 'abgesagt').length;

  // Berechne Bezahlstatus
  const bezahlt = anmeldungen.filter(a => a.bezahlstatus === 'bezahlt').length;
  const offen = anmeldungen.filter(a => a.bezahlstatus === 'offen').length;
  const storniert = anmeldungen.filter(a => a.bezahlstatus === 'storniert').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Debug Info Banner */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4">
        <p className="text-sm font-mono">
          🔍 DEBUG MODE | Version: {DEBUG_VERSION} | Modal State: {showZertifikatModal ? 'OPEN' : 'CLOSED'} | Teilnehmer: {anmeldungen.length}
        </p>
      </div>

      {/* Header */}
      <div className="mb-8">
        <Link href="/schulungen" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Zurück zur Übersicht
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{schulung.titel}</h1>
            <p className="text-gray-600 mt-2">{schulung.beschreibung}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            schulung.status === 'geplant' ? 'bg-yellow-100 text-yellow-800' :
            schulung.status === 'aktiv' ? 'bg-green-100 text-green-800' :
            schulung.status === 'abgeschlossen' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {schulung.status}
          </span>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">Anmeldungen</div>
          <div className="text-2xl font-bold">{anmeldungen.length}</div>
          <div className="text-xs text-gray-500">von {schulung.maxTeilnehmer} max</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">Bestätigt</div>
          <div className="text-2xl font-bold text-green-600">{bestaetigt}</div>
          <div className="text-xs text-gray-500">{angemeldet} angemeldet</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">Bezahlt</div>
          <div className="text-2xl font-bold text-blue-600">{bezahlt}</div>
          <div className="text-xs text-gray-500">{offen} offen</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">Umsatz</div>
          <div className="text-2xl font-bold">€{(bezahlt * schulung.preis).toFixed(2)}</div>
          <div className="text-xs text-gray-500">€{schulung.preis}/Person</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linke Spalte: Details & Teilnehmer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schulungsdetails */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Schulungsdetails</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Typ:</span>
                <p className="font-medium">{schulung.typ}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Hersteller:</span>
                <p className="font-medium">{schulung.hersteller}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Start:</span>
                <p className="font-medium">{startDate.toLocaleDateString('de-DE')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ende:</span>
                <p className="font-medium">{endDate.toLocaleDateString('de-DE')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Dauer:</span>
                <p className="font-medium">{schulung.dauer} Tage</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ort:</span>
                <p className="font-medium">{schulung.ort || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Raum:</span>
                <p className="font-medium">{schulung.raum || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Trainer:</span>
                <p className="font-medium">{schulung.trainer || '-'}</p>
              </div>
            </div>
          </div>

          {/* Teilnehmerliste */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Teilnehmer ({anmeldungen.length})</h2>
              <button 
                onClick={() => setShowTeilnehmerModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Teilnehmer hinzufügen
              </button>
            </div>
            {anmeldungen.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bezahlt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {anmeldungen.map((anmeldung) => (
                      <tr key={anmeldung.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {anmeldung.teilnehmer.vorname} {anmeldung.teilnehmer.nachname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {anmeldung.teilnehmer.firma || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {anmeldung.teilnehmer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            anmeldung.status === 'bestaetigt' ? 'bg-green-100 text-green-800' :
                            anmeldung.status === 'angemeldet' ? 'bg-yellow-100 text-yellow-800' :
                            anmeldung.status === 'teilgenommen' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {anmeldung.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            anmeldung.bezahlstatus === 'bezahlt' ? 'bg-green-100 text-green-800' :
                            anmeldung.bezahlstatus === 'offen' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {anmeldung.bezahlstatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Noch keine Teilnehmer angemeldet
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
                onClick={() => {
                  console.log('📝 Edit button clicked');
                  setShowEditModal(true);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
              >
                📝 Schulung bearbeiten
              </button>
              <button 
                onClick={() => {
                  console.log('👥 Teilnehmer button clicked');
                  setShowTeilnehmerModal(true);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left"
              >
                👥 Teilnehmer hinzufügen
              </button>
              <button 
                onClick={handleZertifikatClick}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-left relative"
              >
                🎓 Zertifikat erstellen
                {anmeldungen.length === 0 && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                    Keine Teilnehmer
                  </span>
                )}
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
              {schulung.calendarEventId && (
                <div>
                  <span className="text-gray-600">Calendar ID:</span>
                  <p className="font-mono text-xs mt-1">{schulung.calendarEventId}</p>
                </div>
              )}
              {schulung.lastSyncedAt && (
                <div>
                  <span className="text-gray-600">Letzte Synchronisation:</span>
                  <p className="text-xs mt-1">
                    {new Date(schulung.lastSyncedAt).toLocaleString('de-DE')}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Erstellt:</span>
                <p className="text-xs mt-1">
                  {new Date(schulung.createdAt).toLocaleString('de-DE')}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Zuletzt geändert:</span>
                <p className="text-xs mt-1">
                  {new Date(schulung.updatedAt).toLocaleString('de-DE')}
                </p>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono">
            <h4 className="font-semibold mb-2">🐛 Debug Info:</h4>
            <div className="space-y-1">
              <div>Version: {DEBUG_VERSION}</div>
              <div>Modal Open: {showZertifikatModal ? 'YES' : 'NO'}</div>
              <div>Teilnehmer Count: {anmeldungen.length}</div>
              <div>Schulung ID: {schulung.id}</div>
              <div>Last Action: {actionLoading ? 'Loading...' : 'Idle'}</div>
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
              console.log('🔄 DEBUG: Closing Zertifikat Modal');
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
