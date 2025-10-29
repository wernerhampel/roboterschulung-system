import Link from 'next/link';

interface Schulung {
  id: string;
  titel: string;
  beschreibung: string | null;
  typ: string;
  hersteller: string;
  startDatum: string;
  endDatum: string;
  dauer: number;
  maxTeilnehmer: number;
  preis: number;
  status: string;
  ort: string | null;
  raum: string | null;
  trainer: string | null;
  _count: {
    anmeldungen: number;
  };
}

async function getSchulungen(): Promise<Schulung[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schulungen`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch schulungen');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching schulungen:', error);
    return [];
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export default async function DashboardPage() {
  const schulungen = await getSchulungen();
  
  // Statistiken berechnen
  const stats = {
    gesamt: schulungen.length,
    bestaetigt: schulungen.filter(s => s.status.toLowerCase() === 'bestaetigt').length,
    laufend: schulungen.filter(s => s.status.toLowerCase() === 'laufend').length,
    abgeschlossen: schulungen.filter(s => s.status.toLowerCase() === 'abgeschlossen').length,
  };
  
  const gesamtTeilnehmer = schulungen.reduce((sum, s) => sum + s._count.anmeldungen, 0);
  const gesamtUmsatz = schulungen
    .filter(s => s.status.toLowerCase() !== 'abgesagt')
    .reduce((sum, s) => sum + (s.preis * s._count.anmeldungen), 0);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            ROBTEC Schulungssystem
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary-focus flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box w-52">
              <li><a>Profil</a></li>
              <li><a>Einstellungen</a></li>
              <li><a>Abmelden</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Navigation Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <a className="tab tab-active">Dashboard</a>
          <Link href="/schulungen" className="tab">Schulungen</Link>
          <Link href="/templates" className="tab">Templates</Link>
          <a className="tab">Teilnehmer</a>
          <a className="tab">Zertifikate</a>
          <a className="tab">Rechnungen</a>
        </div>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <div className="stat-title">Gesamt Schulungen</div>
            <div className="stat-value text-primary">{stats.gesamt}</div>
            <div className="stat-desc">
              Bestätigt: {stats.bestaetigt} | Laufend: {stats.laufend}
            </div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Teilnehmer</div>
            <div className="stat-value text-secondary">{gesamtTeilnehmer}</div>
            <div className="stat-desc">Gesamt angemeldet</div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <div className="stat-title">Abgeschlossen</div>
            <div className="stat-value text-success">{stats.abgeschlossen}</div>
            <div className="stat-desc">Erfolgreich durchgeführt</div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Umsatz</div>
            <div className="stat-value text-accent">{formatCurrency(gesamtUmsatz)}</div>
            <div className="stat-desc">Gesamt generiert</div>
          </div>
        </div>

        {/* Aktuelle Schulungen */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">Aktuelle Schulungen</h2>
              <Link href="/schulungen/neu" className="btn btn-primary">
                + Neue Schulung
              </Link>
            </div>

            {schulungen.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-base-content/60">Keine Schulungen vorhanden</p>
                <Link href="/schulungen/neu" className="btn btn-primary mt-4">
                  Erste Schulung erstellen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Titel</th>
                      <th>Typ</th>
                      <th>Hersteller</th>
                      <th>Datum</th>
                      <th>Teilnehmer</th>
                      <th>Status</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schulungen.map((schulung) => (
                      <tr key={schulung.id}>
                        <td>
                          <div className="font-bold">{schulung.titel}</div>
                          <div className="text-sm opacity-50">{schulung.ort || 'Kein Ort'}</div>
                        </td>
                        <td>
                          <span className="badge badge-ghost">
                            {schulung.typ}
                          </span>
                        </td>
                        <td>{schulung.hersteller}</td>
                        <td>
                          <div className="text-sm">
                            {formatDate(schulung.startDatum)}
                          </div>
                          <div className="text-xs opacity-50">
                            {schulung.dauer} Tag{schulung.dauer !== 1 ? 'e' : ''}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{schulung._count.anmeldungen}</span>
                            <span className="text-xs opacity-50">
                              / {schulung.maxTeilnehmer}
                            </span>
                            {schulung._count.anmeldungen >= schulung.maxTeilnehmer && (
                              <span className="badge badge-error badge-xs">Voll</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            schulung.status.toLowerCase() === 'bestaetigt' ? 'badge-success' :
                            schulung.status.toLowerCase() === 'laufend' ? 'badge-info' :
                            schulung.status.toLowerCase() === 'abgeschlossen' ? 'badge-neutral' :
                            'badge-error'
                          }`}>
                            {schulung.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link
                              href={`/schulungen/${schulung.id}`}
                              className="btn btn-ghost btn-xs"
                            >
                              Details
                            </Link>
                            <Link
                              href={`/schulungen/${schulung.id}/bearbeiten`}
                              className="btn btn-ghost btn-xs"
                            >
                              Bearbeiten
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Templates</h3>
              <p className="text-sm opacity-70">Schulungsvorlagen verwalten</p>
              <div className="card-actions justify-end">
                <Link href="/templates" className="btn btn-primary btn-sm">
                  Zu Templates
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Teilnehmer</h3>
              <p className="text-sm opacity-70">Teilnehmerverwaltung</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm" disabled>
                  Bald verfügbar
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Zertifikate</h3>
              <p className="text-sm opacity-70">Zertifikate erstellen & verwalten</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm" disabled>
                  Bald verfügbar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
        <div>
          <p>ROBTEC Schulungssystem v1.4.1 - Dashboard Status-Fix</p>
          <p className="text-xs opacity-60">© 2024 ROBTEC GmbH - Alle Rechte vorbehalten</p>
        </div>
      </footer>
    </div>
  );
}
