'use client';

import { useState } from 'react';
import Link from 'next/link';

type SyncResult = {
  success: boolean;
  eventsImported: number;
  eventsUpdated: number;
  eventsCreated: number;
  errors: string[];
  summary: string;
};

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ from?: SyncResult; to?: SyncResult } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async (action: 'from' | 'to' | 'full') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Google Calendar Synchronisation</h1>
          <p className="text-gray-600 mt-2">
            Synchronisiere Schulungen und Termine mit deinem Google Calendar
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Zurück zum Dashboard
        </Link>
      </div>

      {/* Sync Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* From Calendar to Database */}
        <div className="card">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Calendar → Datenbank</h3>
              <p className="text-sm text-gray-600 mt-1">
                Events aus Google Calendar importieren
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSync('from')}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Synchronisiere...' : 'Importieren'}
          </button>
        </div>

        {/* From Database to Calendar */}
        <div className="card">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Datenbank → Calendar</h3>
              <p className="text-sm text-gray-600 mt-1">
                Schulungen zu Google Calendar exportieren
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSync('to')}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Synchronisiere...' : 'Exportieren'}
          </button>
        </div>

        {/* Full Bidirectional Sync */}
        <div className="card border-2 border-blue-500">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vollständiger Sync</h3>
              <p className="text-sm text-gray-600 mt-1">
                Bidirektional synchronisieren (empfohlen)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSync('full')}
            disabled={loading}
            className="btn btn-primary w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Synchronisiere...' : 'Vollständig synchronisieren'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Synchronisation läuft...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Fehler bei der Synchronisation</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* FROM Calendar Results */}
          {result.from && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📥 Import von Google Calendar
              </h3>
              <div className={`p-4 rounded-lg ${result.from.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-start space-x-3">
                  {result.from.success ? (
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{result.from.summary}</p>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-600">Importiert</p>
                        <p className="text-2xl font-bold text-blue-600">{result.from.eventsImported}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Neu erstellt</p>
                        <p className="text-2xl font-bold text-green-600">{result.from.eventsCreated}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Aktualisiert</p>
                        <p className="text-2xl font-bold text-yellow-600">{result.from.eventsUpdated}</p>
                      </div>
                    </div>
                    {result.from.errors.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold text-red-800 mb-2">Fehler:</p>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {result.from.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TO Calendar Results */}
          {result.to && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📤 Export zu Google Calendar
              </h3>
              <div className={`p-4 rounded-lg ${result.to.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-start space-x-3">
                  {result.to.success ? (
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{result.to.summary}</p>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-600">Synchronisiert</p>
                        <p className="text-2xl font-bold text-blue-600">{result.to.eventsImported}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Neu erstellt</p>
                        <p className="text-2xl font-bold text-green-600">{result.to.eventsCreated}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Aktualisiert</p>
                        <p className="text-2xl font-bold text-yellow-600">{result.to.eventsUpdated}</p>
                      </div>
                    </div>
                    {result.to.errors.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold text-red-800 mb-2">Fehler:</p>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {result.to.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">✅ Synchronisation abgeschlossen!</h3>
            <p className="text-blue-800 mb-4">Was möchtest du als Nächstes tun?</p>
            <div className="flex gap-3">
              <Link href="/schulungen" className="btn btn-primary">
                Schulungen ansehen
              </Link>
              <Link href="/termine" className="btn btn-secondary">
                Termine ansehen
              </Link>
              <Link href="/" className="btn btn-secondary">
                Zum Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!loading && !result && !error && (
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Wie funktioniert die Synchronisation?</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">📥</span>
              <div>
                <p className="font-semibold">Calendar → Datenbank (Import)</p>
                <p className="text-sm">Liest alle Events aus deinem Google Calendar und erstellt/aktualisiert Schulungen und Termine in der Datenbank.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">📤</span>
              <div>
                <p className="font-semibold">Datenbank → Calendar (Export)</p>
                <p className="text-sm">Erstellt/aktualisiert Calendar Events für alle Schulungen in der Datenbank, die noch kein Event haben.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold">🔄</span>
              <div>
                <p className="font-semibold">Vollständiger Sync (Empfohlen)</p>
                <p className="text-sm">Führt zuerst einen Import aus dem Calendar durch, dann einen Export zur Datenbank. So bleiben beide Systeme synchron.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
