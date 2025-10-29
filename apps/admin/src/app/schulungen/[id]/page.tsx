import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatCurrency, formatDuration, getSchulungsTypLabel, getHerstellerLabel, getStatusColor, calculateAuslastung, getFreiePlaetze } from '@/lib/utils';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
  };
}

async function getSchulungDetails(id: string) {
  const schulung = await prisma.schulung.findUnique({
    where: { id },
    include: {
      anmeldungen: {
        include: {
          teilnehmer: true
        },
        orderBy: {
          anmeldedatum: 'asc'
        }
      },
      _count: {
        select: {
          anmeldungen: true,
          zertifikate: true
        }
      }
    }
  });

  await prisma.$disconnect();
  return schulung;
}

// Lernziele basierend auf Schulungstyp
function getLernziele(typ: string, hersteller: string) {
  const base = {
    grundlagen: [
      'Verständnis der Roboter-Grundlagen und Sicherheitsvorschriften',
      'Bedienung des Teach-Pendants',
      'Erstellen und Editieren einfacher Programme',
      'Ausführen von Grundbewegungen und Werkzeugwechsel',
      'Fehlerdiagnose und Behebung häufiger Probleme'
    ],
    fortgeschritten: [
      'Erweiterte Programmierung mit komplexen Bewegungsabläufen',
      'Integration von Sensoren und externen Geräten',
      'Optimierung von Zykluszeiten',
      'Erweiterte Fehlerdiagnose',
      'Programmierung von Sonderfunktionen'
    ],
    wartung: [
      'Durchführung regelmäßiger Wartungsarbeiten',
      'Austausch von Verschleißteilen',
      'Kalibrierung und Vermessung',
      'Backup und Wiederherstellung',
      'Präventive Instandhaltung'
    ],
    individualschulung: [
      'Individuell auf Ihre Anforderungen zugeschnitten',
      'Fokus auf spezifische Anwendungsfälle',
      'Praxisorientierte Übungen',
      'Flexible Inhaltsgestaltung'
    ]
  };

  return base[typ as keyof typeof base] || base.grundlagen;
}

// Agenda basierend auf Schulungstyp
function getAgenda(typ: string, dauer: number) {
  if (typ === 'grundlagen') {
    return [
      {
        tag: 1,
        titel: 'Einführung & Sicherheit',
        themen: [
          'Begrüßung und Vorstellung',
          'Sicherheitsunterweisung',
          'Roboterkomponenten und Aufbau',
          'NOT-HALT und Sicherheitseinrichtungen',
          'Praktische Übungen: Roboter ein- und ausschalten'
        ]
      },
      {
        tag: 2,
        titel: 'Bedienung & Navigation',
        themen: [
          'Teach-Pendant Grundlagen',
          'Menüstruktur und Navigation',
          'Betriebsarten (T1, T2, Auto)',
          'Koordinatensysteme',
          'Manuelle Verfahrung'
        ]
      },
      {
        tag: 3,
        titel: 'Erste Programme',
        themen: [
          'Programmerstellung',
          'Bewegungsbefehle (PTP, LIN)',
          'Punkte teachen',
          'Programmtest und -optimierung',
          'Geschwindigkeitseinstellungen'
        ]
      },
      {
        tag: 4,
        titel: 'Erweiterte Programmierung',
        themen: [
          'Werkzeuge und Bases',
          'I/O-Signale',
          'Programmverzweigungen',
          'Schleifen und Zähler',
          'Unterprogramme'
        ]
      },
      {
        tag: 5,
        titel: 'Fehlerdiagnose',
        themen: [
          'Fehlermeldungen verstehen',
          'Diagnose-Tools',
          'Häufige Fehler und Lösungen',
          'Backup und Restore',
          'Wartungshinweise'
        ]
      },
      {
        tag: 6,
        titel: 'Praxis & Abschluss',
        themen: [
          'Freie Projektarbeit',
          'Komplexe Bewegungsabläufe',
          'Optimierung',
          'Q&A Session',
          'Zertifikatsübergabe'
        ]
      }
    ];
  }

  if (typ === 'fortgeschritten') {
    return [
      {
        tag: 1,
        titel: 'Wiederholung & Vertiefung',
        themen: [
          'Auffrischung Grundlagen',
          'Koordinatensysteme Advanced',
          'Interpolationsarten',
          'Bahnplanung'
        ]
      },
      {
        tag: 2,
        titel: 'Erweiterte Programmierung',
        themen: [
          'Strukturierte Programmierung',
          'Datentypen und Arrays',
          'Mathematische Funktionen',
          'String-Verarbeitung'
        ]
      },
      {
        tag: 3,
        titel: 'Kommunikation & Integration',
        themen: [
          'Bus-Systeme',
          'Profinet/Profibus',
          'Ethernet/IP',
          'OPC UA Grundlagen'
        ]
      },
      {
        tag: 4,
        titel: 'Optimierung & Projekt',
        themen: [
          'Zykluszeit-Optimierung',
          'Bahnglättung',
          'Praktisches Projekt',
          'Abschlusspräsentation'
        ]
      }
    ];
  }

  if (typ === 'wartung') {
    return [
      {
        tag: 1,
        titel: 'Wartungsgrundlagen',
        themen: [
          'Wartungsplan und Intervalle',
          'Werkzeuge und Hilfsmittel',
          'Dokumentation',
          'Sicherheitsaspekte'
        ]
      },
      {
        tag: 2,
        titel: 'Mechanische Wartung',
        themen: [
          'Achsgetriebe',
          'Lager und Schmierung',
          'Riemen und Ketten',
          'Kabelführung'
        ]
      },
      {
        tag: 3,
        titel: 'Elektrische Systeme & Abschluss',
        themen: [
          'Schaltschrank-Wartung',
          'Kalibrierung',
          'Software-Updates',
          'Fehlerdiagnose',
          'Praktische Übungen'
        ]
      }
    ];
  }

  // Individualschulung - flexible Agenda
  const tageArray = [];
  for (let i = 1; i <= dauer; i++) {
    tageArray.push({
      tag: i,
      titel: `Tag ${i}`,
      themen: ['Inhalte werden individuell nach Ihren Anforderungen gestaltet']
    });
  }
  return tageArray;
}

// Hersteller-spezifische Informationen
function getHerstellerInfo(hersteller: string) {
  const info = {
    kuka: {
      controller: 'KRC4 / KRC5',
      software: 'WorkVisual',
      programmiersprache: 'KRL (KUKA Robot Language)',
      besonderheiten: ['Inline-Formulare', 'Submit Interpreter', 'Safety Configuration']
    },
    abb: {
      controller: 'IRC5 / OmniCore',
      software: 'RobotStudio',
      programmiersprache: 'RAPID',
      besonderheiten: ['TrueMove', 'QuickMove', 'Integrated Vision']
    },
    fanuc: {
      controller: 'R-30iB / R-30iB Plus',
      software: 'ROBOGUIDE',
      programmiersprache: 'KAREL / TP',
      besonderheiten: ['iRVision', 'Dual Check Safety', 'Zero Down Time']
    },
    siemens: {
      controller: 'SIMATIC S7',
      software: 'TIA Portal',
      programmiersprache: 'SCL / LAD / FBD',
      besonderheiten: ['Safety Integrated', 'Motion Control', 'PROFIsafe']
    },
    yaskawa: {
      controller: 'YRC1000 / YRC1000micro',
      software: 'MotoSim',
      programmiersprache: 'INFORM',
      besonderheiten: ['Arc Welding Package', 'Multiple Robot Control', 'Smart Pendant']
    },
    'universal-robots': {
      controller: 'CB-Series / e-Series',
      software: 'PolyScope',
      programmiersprache: 'URScript',
      besonderheiten: ['Collaborative', 'Easy Programming', 'Vision System']
    },
    staeubli: {
      controller: 'CS9',
      software: 'SRS (Stäubli Robotics Suite)',
      programmiersprache: 'VAL3',
      besonderheiten: ['uniVAL plc', 'Cleanroom Certified', 'High Speed']
    },
    kawasaki: {
      controller: 'E-Controller',
      software: 'K-ROSET',
      programmiersprache: 'AS Language',
      besonderheiten: ['Palletizing Functions', 'Laser Tracking', 'Weld Tech']
    },
    denso: {
      controller: 'RC8',
      software: 'WINCAPS III',
      programmiersprache: 'PacScript',
      besonderheiten: ['High Speed', 'Compact Design', 'Vision Guide']
    }
  };

  return info[hersteller.toLowerCase() as keyof typeof info] || {
    controller: 'Standard Controller',
    software: 'Hersteller-Software',
    programmiersprache: 'Hersteller-spezifisch',
    besonderheiten: []
  };
}

export default async function SchulungDetailPage({ params }: PageProps) {
  const schulung = await getSchulungDetails(params.id);

  if (!schulung) {
    notFound();
  }

  const auslastung = calculateAuslastung(schulung._count.anmeldungen, schulung.maxTeilnehmer);
  const freiePlaetze = getFreiePlaetze(schulung._count.anmeldungen, schulung.maxTeilnehmer);
  const lernziele = getLernziele(schulung.typ, schulung.hersteller);
  const agenda = getAgenda(schulung.typ, schulung.dauer);
  const herstellerInfo = getHerstellerInfo(schulung.hersteller);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/schulungen"
                className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center"
              >
                ← Zurück zur Übersicht
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                {schulung.titel}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schulung.status)}`}>
                  {schulung.status === 'bestaetigt' ? 'Bestätigt' :
                   schulung.status === 'laufend' ? 'Laufend' :
                   schulung.status === 'abgeschlossen' ? 'Abgeschlossen' :
                   schulung.status === 'abgesagt' ? 'Abgesagt' :
                   schulung.status}
                </span>
                <span className="text-gray-600">
                  {getSchulungsTypLabel(schulung.typ)}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">
                  {getHerstellerLabel(schulung.hersteller)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(Number(schulung.preis))}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                pro Teilnehmer
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptinhalt */}
          <div className="lg:col-span-2 space-y-6">
            {/* Beschreibung */}
            {schulung.beschreibung && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Beschreibung
                </h2>
                <div className="prose max-w-none text-gray-600">
                  {schulung.beschreibung}
                </div>
              </div>
            )}

            {/* Lernziele */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎯 Lernziele
              </h2>
              <ul className="space-y-3">
                {lernziele.map((ziel, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-600">{ziel}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Agenda */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📅 Agenda ({formatDuration(schulung.dauer)})
              </h2>
              <div className="space-y-4">
                {agenda.map((tag) => (
                  <div key={tag.tag} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Tag {tag.tag}: {tag.titel}
                    </h3>
                    <ul className="space-y-1">
                      {tag.themen.map((thema, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{thema}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Hersteller-spezifische Infos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🤖 Technische Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Controller</div>
                  <div className="font-medium text-gray-900">{herstellerInfo.controller}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Software</div>
                  <div className="font-medium text-gray-900">{herstellerInfo.software}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Programmiersprache</div>
                  <div className="font-medium text-gray-900">{herstellerInfo.programmiersprache}</div>
                </div>
              </div>
              {herstellerInfo.besonderheiten.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Besonderheiten</div>
                  <div className="flex flex-wrap gap-2">
                    {herstellerInfo.besonderheiten.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Materialien */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📚 Enthaltene Materialien
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <span className="mr-3">✓</span>
                  <span>Umfangreiches Schulungshandbuch (digital & gedruckt)</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="mr-3">✓</span>
                  <span>Übungsdateien und Beispielprogramme</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="mr-3">✓</span>
                  <span>Persönliches Teilnahmezertifikat</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="mr-3">✓</span>
                  <span>3 Monate kostenlosen E-Mail-Support</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="mr-3">✓</span>
                  <span>Zugang zur Online-Lernplattform</span>
                </li>
              </ul>
            </div>

            {/* Voraussetzungen */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Voraussetzungen
              </h2>
              <div className="text-gray-600">
                {schulung.typ === 'grundlagen' && (
                  <p>Keine Vorkenntnisse erforderlich. Technisches Verständnis ist von Vorteil.</p>
                )}
                {schulung.typ === 'fortgeschritten' && (
                  <p>Abgeschlossene Grundlagenschulung oder gleichwertige Kenntnisse erforderlich.</p>
                )}
                {schulung.typ === 'wartung' && (
                  <p>Grundkenntnisse in Robotik und Elektrotechnik erforderlich.</p>
                )}
                {schulung.typ === 'individualschulung' && (
                  <p>Werden individuell mit Ihnen abgestimmt.</p>
                )}
              </div>
            </div>

            {/* Zielgruppe */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                👥 Zielgruppe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schulung.typ === 'grundlagen' && (
                  <>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Maschinenbediener</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Instandhalter</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Techniker</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Quereinsteiger</span>
                    </div>
                  </>
                )}
                {schulung.typ === 'fortgeschritten' && (
                  <>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Programmierer</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Anlagenplaner</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Projektleiter</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Systemintegratoren</span>
                    </div>
                  </>
                )}
                {schulung.typ === 'wartung' && (
                  <>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Wartungspersonal</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Service-Techniker</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Instandhalter</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      <span>Facility Manager</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Teilnehmerliste */}
            {schulung.anmeldungen.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  👥 Teilnehmerliste ({schulung.anmeldungen.length})
                </h2>
                <div className="space-y-3">
                  {schulung.anmeldungen.map((anmeldung) => (
                    <div key={anmeldung.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {anmeldung.teilnehmer.vorname} {anmeldung.teilnehmer.nachname}
                        </div>
                        {anmeldung.teilnehmer.firma && (
                          <div className="text-sm text-gray-500">
                            {anmeldung.teilnehmer.firma}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          anmeldung.status === 'gebucht' ? 'bg-green-100 text-green-800' :
                          anmeldung.status === 'reserviert' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {anmeldung.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Eckdaten */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Eckdaten
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">📅 Startdatum</div>
                  <div className="font-medium text-gray-900">{formatDate(schulung.startDatum)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">🏁 Enddatum</div>
                  <div className="font-medium text-gray-900">{formatDate(schulung.endDatum)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">⏱️ Dauer</div>
                  <div className="font-medium text-gray-900">{formatDuration(schulung.dauer)}</div>
                </div>
                {schulung.ort && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">📍 Ort</div>
                    <div className="font-medium text-gray-900">{schulung.ort}</div>
                  </div>
                )}
                {schulung.raum && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">🚪 Raum</div>
                    <div className="font-medium text-gray-900">{schulung.raum}</div>
                  </div>
                )}
                {schulung.trainer && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">👨‍🏫 Trainer</div>
                    <div className="font-medium text-gray-900">{schulung.trainer}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Auslastung */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 Auslastung
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Angemeldet:</span>
                  <span className="font-medium text-gray-900">
                    {schulung._count.anmeldungen} / {schulung.maxTeilnehmer}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      auslastung >= 90 ? 'bg-red-500' :
                      auslastung >= 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${auslastung}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Freie Plätze:</span>
                  <span className={`font-medium ${
                    freiePlaetze === 0 ? 'text-red-600' :
                    freiePlaetze <= 3 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {freiePlaetze}
                  </span>
                </div>
              </div>
            </div>

            {/* Aktionen */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ⚡ Aktionen
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Teilnehmer hinzufügen
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Bearbeiten
                </button>
                <Link
                  href={`/schulungen/${schulung.id}/zertifikate`}
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Zertifikate verwalten
                </Link>
              </div>
            </div>

            {/* Kontakt */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💬 Fragen?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Kontaktieren Sie uns für weitere Informationen oder individuelle Anpassungen.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📧</span>
                  <span>info@robtec.de</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📞</span>
                  <span>+49 123 456789</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
