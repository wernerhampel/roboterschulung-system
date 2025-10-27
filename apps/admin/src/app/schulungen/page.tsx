'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Schulung {
  id: string;
  titel: string;
  typ: 'grundlagen' | 'praxis' | 'online' | 'sonstige';
  hersteller: 'kuka' | 'abb' | 'mitsubishi' | 'universal_robots' | 'sonstige';
  startDatum: string;
  endDatum: string;
  dauer: number;
  maxTeilnehmer: number;
  status: 'geplant' | 'bestaetigt' | 'laufend' | 'abgeschlossen' | 'abgesagt';
  ort?: string;
  calendarEventId?: string;
  _count?: {
    anmeldungen: number;
  };
}

export default function SchulungenPage() {
  const [schulungen, setSchulungen] = useState<Schulung[]>([]);
  const [filteredSchulungen, setFilteredSchulungen] = useState<Schulung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTyp, setFilterTyp] = useState<string>('alle');
  const [filterHersteller, setFilterHersteller] = useState<string>('alle');
  const [filterStatus, setFilterStatus] = useState<string>('alle');

  useEffect(() => {
    loadSchulungen();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schulungen, searchTerm, filterTyp, filterHersteller, filterStatus]);

  async function loadSchulungen() {
    try {
      setLoading(true);
      const response = await fetch('/api/schulungen');
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Schulungen');
      }

      const data = await response.json();
      setSchulungen(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...schulungen];

    // Suchbegriff
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ort?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Typ Filter
    if (filterTyp !== 'alle') {
      filtered = filtered.filter(s => s.typ === filterTyp);
    }

    // Hersteller Filter
    if (filterHersteller !== 'alle') {
      filtered = filtered.filter(s => s.hersteller === filterHersteller);
    }

    // Status Filter
    if (filterStatus !== 'alle') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    setFilteredSchulungen(filtered);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Lade Schulungen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schulungen</h1>
              <p className="text-gray-600 mt-1">
                Schulungskatalog verwalten
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Zurück zum Dashboard
              </Link>
              <Link
                href="/schulungen/neu"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Neue Schulung
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Gesamt</div>
            <div className="text-3xl font-bold text-gray-900">{schulungen.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Geplant</div>
            <div className="text-3xl font-bold text-blue-600">
              {schulungen.filter(s => s.status === 'geplant').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Bestätigt</div>
            <div className="text-3xl font-bold text-green-600">
              {schulungen.filter(s => s.status === 'bestaetigt').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-gray-600 text-sm mb-1">Laufend</div>
            <div className="text-3xl font-bold text-purple-600">
              {schulungen.filter(s => s.status === 'laufend').length}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Suche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <input
                type="text"
                placeholder="Titel oder Ort..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Typ Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ
              </label>
              <select
                value={filterTyp}
                onChange={(e) => setFilterTyp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="alle">Alle Typen</option>
                <option value="grundlagen">Grundlagen</option>
                <option value="praxis">Praxis</option>
                <option value="online">Online</option>
                <option value="sonstige">Sonstige</option>
              </select>
            </div>

            {/* Hersteller Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hersteller
              </label>
              <select
                value={filterHersteller}
                onChange={(e) => setFilterHersteller(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="alle">Alle Hersteller</option>
                <option value="kuka">KUKA</option>
                <option value="abb">ABB</option>
                <option value="mitsubishi">Mitsubishi</option>
                <option value="universal_robots">Universal Robots</option>
                <option value="sonstige">Sonstige</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="alle">Alle Status</option>
                <option value="geplant">Geplant</option>
                <option value="bestaetigt">Bestätigt</option>
                <option value="laufend">Laufend</option>
                <option value="abgeschlossen">Abgeschlossen</option>
                <option value="abgesagt">Abgesagt</option>
              </select>
            </div>
          </div>

          {/* Reset Filter */}
          {(searchTerm || filterTyp !== 'alle' || filterHersteller !== 'alle' || filterStatus !== 'alle') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterTyp('alle');
                setFilterHersteller('alle');
                setFilterStatus('alle');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              ✕ Filter zurücksetzen
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Schulungen Liste */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hersteller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dauer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teilnehmer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchulungen.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterTyp !== 'alle' || filterHersteller !== 'alle' || filterStatus !== 'alle' ? (
                        <>
                          <div className="text-4xl mb-2">🔍</div>
                          <p>Keine Schulungen mit diesen Filtern gefunden</p>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">📚</div>
                          <p>Noch keine Schulungen vorhanden</p>
                          <Link
                            href="/sync"
                            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                          >
                            → Jetzt Google Calendar synchronisieren
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSchulungen.map((schulung) => (
                    <tr key={schulung.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {schulung.titel}
                            </div>
                            {schulung.ort && (
                              <div className="text-sm text-gray-500">
                                📍 {schulung.ort}
                              </div>
                            )}
                            {schulung.calendarEventId && (
                              <div className="text-xs text-gray-400 mt-1">
                                🗓️ Aus Google Calendar
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getTypLabel(schulung.typ)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getHerstellerLabel(schulung.hersteller)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{formatDate(schulung.startDatum)}</div>
                        {schulung.startDatum !== schulung.endDatum && (
                          <div className="text-gray-500">
                            bis {formatDate(schulung.endDatum)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {schulung.dauer} Tag{schulung.dauer !== 1 ? 'e' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          {schulung._count?.anmeldungen || 0} / {schulung.maxTeilnehmer}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(((schulung._count?.anmeldungen || 0) / schulung.maxTeilnehmer) * 100)}% belegt
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schulung.status)}`}>
                          {getStatusLabel(schulung.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/schulungen/${schulung.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ergebnis Anzeige */}
        {filteredSchulungen.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            {filteredSchulungen.length} von {schulungen.length} Schulung{schulungen.length !== 1 ? 'en' : ''} angezeigt
          </div>
        )}
      </div>
    </div>
  );
}
