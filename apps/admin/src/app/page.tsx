import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const schulungen = await prisma.schulung.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const schulungenCount = await prisma.schulung.count();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <Link href="/schulungen/neu" className="btn btn-primary">
          + Neue Schulung
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Schulungen</h3>
          <p className="text-4xl font-bold text-blue-600">{schulungenCount}</p>
          <p className="text-sm text-gray-500 mt-2">Gesamt im System</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nächste Termine</h3>
          <p className="text-4xl font-bold text-green-600">-</p>
          <p className="text-sm text-gray-500 mt-2">In den nächsten 30 Tagen</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Zertifikate</h3>
          <p className="text-4xl font-bold text-purple-600">-</p>
          <p className="text-sm text-gray-500 mt-2">Ausgestellt diesen Monat</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/schulungen" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Schulungen</h3>
              <p className="text-sm text-gray-600 mt-1">Schulungskatalog verwalten</p>
            </div>
          </div>
        </Link>

        <Link href="/termine" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Termine</h3>
              <p className="text-sm text-gray-600 mt-1">Termine planen & verwalten</p>
            </div>
          </div>
        </Link>

        <Link href="/teilnehmer" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Teilnehmer</h3>
              <p className="text-sm text-gray-600 mt-1">Teilnehmerverwaltung</p>
            </div>
          </div>
        </Link>

        <Link href="/anmeldungen" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Anmeldungen</h3>
              <p className="text-sm text-gray-600 mt-1">Anmeldungen verwalten</p>
            </div>
          </div>
        </Link>

        <Link href="/zertifikate" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Zertifikate</h3>
              <p className="text-sm text-gray-600 mt-1">Zertifikate erstellen & verwalten</p>
            </div>
          </div>
        </Link>

        <Link href="/berichte" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Berichte</h3>
              <p className="text-sm text-gray-600 mt-1">Statistiken & Auswertungen</p>
            </div>
          </div>
        </Link>

        <Link href="/sync" className="card hover:shadow-lg transition-shadow border-2 border-blue-500">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Calendar Sync</h3>
              <p className="text-sm text-gray-600 mt-1">Google Calendar synchronisieren</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Schulungen */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Letzte Schulungen</h3>
        {schulungen.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Noch keine Schulungen vorhanden.</p>
            <Link href="/schulungen/neu" className="btn btn-primary mt-4 inline-block">
              Erste Schulung erstellen
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Typ</th>
                  <th>Hersteller</th>
                  <th>Dauer</th>
                  <th>Max. Teilnehmer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schulungen.map((schulung) => {
                  const getTypLabel = (typ: string) => {
                    const labels: Record<string, string> = {
                      grundlagen: 'Grundlagen',
                      praxis: 'Praxis',
                      online: 'Online',
                      sonstige: 'Sonstige'
                    };
                    return labels[typ] || typ;
                  };

                  const getHerstellerLabel = (hersteller: string) => {
                    const labels: Record<string, string> = {
                      kuka: 'KUKA',
                      abb: 'ABB',
                      mitsubishi: 'Mitsubishi',
                      universal_robots: 'Universal Robots',
                      sonstige: 'Sonstige'
                    };
                    return labels[hersteller] || hersteller;
                  };

                  const getStatusLabel = (status: string) => {
                    const labels: Record<string, string> = {
                      geplant: 'Geplant',
                      bestaetigt: 'Bestätigt',
                      laufend: 'Laufend',
                      abgeschlossen: 'Abgeschlossen',
                      abgesagt: 'Abgesagt'
                    };
                    return labels[status] || status;
                  };

                  return (
                    <tr key={schulung.id}>
                      <td>
                        <Link href={`/schulungen/${schulung.id}`} className="text-blue-600 hover:underline font-medium">
                          {schulung.titel}
                        </Link>
                      </td>
                      <td>{getTypLabel(schulung.typ)}</td>
                      <td>{getHerstellerLabel(schulung.hersteller)}</td>
                      <td>{schulung.dauer} Tage</td>
                      <td>{schulung.maxTeilnehmer}</td>
                      <td>
                        <span className={`badge ${
                          schulung.status === 'bestaetigt' ? 'badge-success' :
                          schulung.status === 'geplant' ? 'badge-info' :
                          schulung.status === 'abgeschlossen' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {getStatusLabel(schulung.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
