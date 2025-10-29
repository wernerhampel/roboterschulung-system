import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { formatDate, formatCurrency } from '@/lib/utils';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
  };
}

async function getSchulungDetails(id: string) {
  try {
    const schulung = await prisma.schulung.findUnique({
      where: { id },
      include: {
        anmeldungen: {
          include: {
            teilnehmer: true
          },
          orderBy: {
            anmeldedatum: 'desc'
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

    return schulung;
  } catch (error) {
    console.error('Error fetching schulung:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function SchulungsDetailPage({ params }: PageProps) {
  const schulung = await getSchulungDetails(params.id);

  if (!schulung) {
    notFound();
  }

  const freiePlaetze = schulung.maxTeilnehmer - schulung._count.anmeldungen;
  const auslastung = (schulung._count.anmeldungen / schulung.maxTeilnehmer) * 100;

  const getSchulungsinhalte = () => {
    const baseContent = {
      grundlagen: {
        beschreibung: `Grundlagenschulung für ${schulung.hersteller} Roboter. Erlernen Sie die sichere Bedienung, Programmierung und Wartung von ${schulung.hersteller} Industrierobotern.`,
        lernziele: [
          'Sicherer Umgang mit dem Robotersystem',
          'Verständnis der Roboterkinematik und Koordinatensysteme',
          'Grundlegende Programmierkenntnisse',
          'Erstellen und Bearbeiten von Bewegungsprogrammen',
          'Fehlerdiagnose und Fehlerbehebung',
          'Wartung und Instandhaltung',
          'Sicherheitsbestimmungen nach ISO 10218'
        ],
        agenda: [
          {
            tag: 1,
            titel: 'Einführung und Sicherheit',
            themen: [
              'Begrüßung und Organisatorisches',
              'Sicherheitsunterweisung und Schutzmaßnahmen',
              'Aufbau und Komponenten des Robotersystems',
              'Bedienfeld und Teach Pendant',
              'Koordinatensysteme und Achsbezeichnungen',
              'Praktische Übungen: Handbedienung'
            ]
          },
          {
            tag: 2,
            titel: 'Grundlagen der Programmierung',
            themen: [
              'Programmstruktur und -aufbau',
              'Bewegungsbefehle (PTP, LIN, CIRC)',
              'Punkteverwaltung und Koordinaten',
              'Ein- und Ausgänge (I/O)',
              'Einfache Programmierung',
              'Praktische Übungen: Erstes Programm'
            ]
          },
          {
            tag: 3,
            titel: 'Erweiterte Programmierung',
            themen: [
              'Programmverzweigungen und Schleifen',
              'Variablen und Datentypen',
              'Unterprogramme und Funktionen',
              'Werkzeug- und Basiskalibrierung',
              'Greifer und externe Achsen',
              'Praktische Übungen: Komplexe Programme'
            ]
          },
          {
            tag: 4,
            titel: 'Optimierung und Fehlersuche',
            themen: [
              'Bahnoptimierung und Geschwindigkeitsanpassung',
              'Kollisionsvermeidung',
              'Fehlerdiagnose und Systemstatus',
              'Backup und Restore',
              'Wartungsarbeiten',
              'Praktische Übungen: Fehlerszenarien'
            ]
          },
          {
            tag: 5,
            titel: 'Praxisprojekt',
            themen: [
              'Eigenständiges Praxisprojekt',
              'Komplette Programmierung einer Anwendung',
              'Optimierung und Tests',
              'Dokumentation',
              'Präsentation der Ergebnisse'
            ]
          },
          {
            tag: 6,
            titel: 'Prüfung und Zertifizierung',
            themen: [
              'Theoretische Prüfung (90 Minuten)',
              'Praktische Prüfung (120 Minuten)',
              'Besprechung der Ergebnisse',
              'Zertifikatsübergabe',
              'Abschlussgespräch und Feedback'
            ]
          }
        ],
        materialien: [
          'Umfangreiche Schulungsunterlagen (digital und gedruckt)',
          'Programmierbeispiele und Vorlagen',
          'Übungsaufgaben mit Lösungen',
          'Checklisten für Wartung und Fehlersuche',
          'Zugang zur Online-Lernplattform (6 Monate)',
          'Zertifikat nach erfolgreicher Prüfung'
        ],
        voraussetzungen: [
          'Technisches Grundverständnis',
          'Grundkenntnisse in Mechanik und Elektrotechnik',
          'PC-Kenntnisse',
          'Keine Programmierkenntnisse erforderlich'
        ],
        zielgruppe: [
          'Inbetriebnahme-Techniker',
          'Servicetechniker',
          'Produktionsmitarbeiter',
          'Meister und Vorarbeiter',
          'Wartungspersonal',
          'Projektingenieure'
        ]
      },
      fortgeschritten: {
        beschreibung: `Fortgeschrittenen-Schulung für ${schulung.hersteller} Roboter. Vertiefen Sie Ihre Kenntnisse in komplexer Programmierung, Prozessoptimierung und Systemintegration.`,
        lernziele: [
          'Komplexe Bewegungsabläufe programmieren',
          'Sensorintegration und externe Systeme',
          'Bahnplanung und Optimierung',
          'Fehlerbehandlung und Recovery-Strategien',
          'Netzwerkkommunikation und Fieldbus',
          'Performance-Tuning und Diagnose',
          'Safety-Funktionen konfigurieren'
        ],
        agenda: [
          {
            tag: 1,
            titel: 'Erweiterte Programmierkonzepte',
            themen: [
              'Komplexe Datenstrukturen',
              'Modulare Programmierung',
              'Fehlerbehandlung und Exception Handling',
              'Datenbankanbindung',
              'Praktische Übungen'
            ]
          },
          {
            tag: 2,
            titel: 'Systemintegration',
            themen: [
              'Netzwerkkommunikation',
              'Profinet/EtherCAT Integration',
              'OPC UA und Industrie 4.0',
              'SPS-Anbindung',
              'Praktische Übungen'
            ]
          },
          {
            tag: 3,
            titel: 'Sensorik und Vision',
            themen: [
              'Kraftmomentensensoren',
              'Vision-Systeme',
              'Tracking und Pick & Place',
              'Kalibrierung',
              'Praktische Übungen'
            ]
          },
          {
            tag: 4,
            titel: 'Abschlussprojekt und Zertifizierung',
            themen: [
              'Komplexes Praxisprojekt',
              'Theoretische Prüfung',
              'Praktische Prüfung',
              'Zertifikatsübergabe'
            ]
          }
        ],
        materialien: [
          'Erweiterte Schulungsunterlagen',
          'Komplexe Programmierbeispiele',
          'Integration-Templates',
          'Troubleshooting-Handbuch',
          'Zertifikat nach erfolgreicher Prüfung'
        ],
        voraussetzungen: [
          'Abgeschlossene Grundlagenschulung oder',
          'Mindestens 1 Jahr Erfahrung mit Robotern',
          'Solide Programmierkenntnisse',
          'Verständnis von Netzwerktechnik'
        ],
        zielgruppe: [
          'Erfahrene Programmierer',
          'Systemintegratoren',
          'Projektleiter',
          'Senior-Techniker'
        ]
      },
      wartung: {
        beschreibung: `Wartungs- und Instandhaltungsschulung für ${schulung.hersteller} Roboter. Lernen Sie präventive Wartung, Fehlerdiagnose und Reparaturtechniken.`,
        lernziele: [
          'Wartungspläne erstellen und umsetzen',
          'Mechanische Komponenten prüfen und warten',
          'Elektrische Systeme überprüfen',
          'Kalibrierung und Justierung',
          'Verschleißteile identifizieren und austauschen',
          'Diagnosetools effektiv einsetzen',
          'Dokumentation und Reporting'
        ],
        agenda: [
          {
            tag: 1,
            titel: 'Wartungsgrundlagen',
            themen: [
              'Sicherheitsvorschriften',
              'Wartungsintervalle',
              'Werkzeuge und Messmittel',
              'Dokumentation',
              'Praktische Übungen'
            ]
          },
          {
            tag: 2,
            titel: 'Mechanische Wartung',
            themen: [
              'Getriebe und Antriebe',
              'Verschleißteile',
              'Schmierung',
              'Kalibrierung',
              'Praktische Übungen'
            ]
          },
          {
            tag: 3,
            titel: 'Elektrische Wartung und Diagnose',
            themen: [
              'Steuerungssysteme',
              'Motoren und Geber',
              'Fehlerdiagnose',
              'Austausch von Komponenten',
              'Praktische Übungen'
            ]
          }
        ],
        materialien: [
          'Wartungshandbuch',
          'Checklisten',
          'Ersatzteillisten',
          'Diagnose-Software',
          'Zertifikat'
        ],
        voraussetzungen: [
          'Grundkenntnisse in Robotertechnik',
          'Elektrische Fachkraft oder vergleichbar',
          'Mechanische Grundkenntnisse'
        ],
        zielgruppe: [
          'Wartungspersonal',
          'Servicetechniker',
          'Instandhalter'
        ]
      },
      individualschulung: {
        beschreibung: `Individuelle Schulung für ${schulung.hersteller} Roboter. Maßgeschneiderte Inhalte nach Ihren spezifischen Anforderungen.`,
        lernziele: [
          'Kundenspezifische Lernziele',
          'Fokus auf individuelle Anforderungen',
          'Praxisnahe Beispiele aus Ihrem Umfeld'
        ],
        agenda: [
          {
            tag: 1,
            titel: 'Nach Kundenwunsch',
            themen: [
              'Individuelle Themenzusammenstellung'
            ]
          }
        ],
        materialien: [
          'Kundenspezifische Unterlagen',
          'Zertifikat nach Vereinbarung'
        ],
        voraussetzungen: [
          'Nach Absprache'
        ],
        zielgruppe: [
          'Alle Berufsgruppen'
        ]
      }
    };

    return baseContent[schulung.typ as keyof typeof baseContent] || baseContent.grundlagen;
  };

  const inhalte = getSchulungsinhalte();

  const getHerstellerInfo = () => {
    const herstellerData: Record<string, { controller: string; software: string; besonderheiten: string[] }> = {
      kuka: {
        controller: 'KRC4/KRC5',
        software: 'KUKA System Software (KSS)',
        besonderheiten: [
          'KRL Programmiersprache',
          'SmartPad Bediengerät',
          'KUKA.SafeOperation',
          'WorkVisual Konfigurationssoftware'
        ]
      },
      abb: {
        controller: 'IRC5/OmniCore',
        software: 'RobotStudio',
        besonderheiten: [
          'RAPID Programmiersprache',
          'FlexPendant Bediengerät',
          'SafeMove Sicherheitsfunktionen',
          'RobotStudio Offline-Programmierung'
        ]
      },
      fanuc: {
        controller: 'R-30iB/R-30iB Plus',
        software: 'ROBOGUIDE',
        besonderheiten: [
          'TP Programmiersprache',
          'iPendant Touch Bediengerät',
          'DCS Kollisionserkennung',
          'ROBOGUIDE Simulation'
        ]
      },
      siemens: {
        controller: 'SIMATIC S7',
        software: 'TIA Portal',
        besonderheiten: [
          'SCL/LAD Programmierung',
          'Safety Integrated',
          'SIMATIC Automation',
          'Profinet Integration'
        ]
      },
      yaskawa: {
        controller: 'YRC1000/YRC1000micro',
        software: 'MotoSim EG',
        besonderheiten: [
          'INFORM Programmiersprache',
          'Smart Pendant',
          'Functional Safety',
          'MotoSim 3D-Simulation'
        ]
      },
      universal_robots: {
        controller: 'CB-Series/e-Series',
        software: 'PolyScope',
        besonderheiten: [
          'URScript Programmierung',
          'Touch-Screen Teach Pendant',
          'Kollaborativ (Cobot)',
          'Kraftregelung integriert'
        ]
      },
      staubli: {
        controller: 'CS9',
        software: 'Stäubli Robotics Suite',
        besonderheiten: [
          'VAL3 Programmiersprache',
          'uniVAL plc',
          'Cleanroom-geeignet',
          'Hochgeschwindigkeitsanwendungen'
        ]
      },
      kawasaki: {
        controller: 'E-Controller',
        software: 'K-ROSET',
        besonderheiten: [
          'AS Programmiersprache',
          'Teach Pendant',
          'Duaro (kollaborativ)',
          'Hochleistungsroboter'
        ]
      },
      denso: {
        controller: 'RC8/RC8A',
        software: 'WINCAPS Plus',
        besonderheiten: [
          'PacScript',
          'Kompakte Bauweise',
          'Cobotta (kollaborativ)',
          'Vision-Integration'
        ]
      }
    };

    return herstellerData[schulung.hersteller] || {
      controller: 'Standard Controller',
      software: 'Herstellersoftware',
      besonderheiten: []
    };
  };

  const herstellerInfo = getHerstellerInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/schulungen" 
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← Zurück zur Übersicht
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{schulung.titel}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {schulung.typ.toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                  {schulung.hersteller.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  schulung.status === 'geplant' ? 'bg-yellow-100 text-yellow-800' :
                  schulung.status === 'aktiv' ? 'bg-green-100 text-green-800' :
                  schulung.status === 'abgeschlossen' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {schulung.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(schulung.preis)}
              </div>
              <div className="text-sm text-gray-600">pro Teilnehmer (netto)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Beschreibung</h2>
              <p className="text-gray-700 leading-relaxed">
                {schulung.beschreibung || inhalte.beschreibung}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lernziele</h2>
              <ul className="space-y-3">
                {inhalte.lernziele.map((ziel, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{ziel}</span>
                  </li>
                ))}
              </ul>
            </div>

            {inhalte.agenda && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Schulungsagenda</h2>
                <div className="space-y-6">
                  {inhalte.agenda.map((tag, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-sm mr-3">
                          {tag.tag}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{tag.titel}</h3>
                      </div>
                      <ul className="space-y-2 ml-11">
                        {tag.themen.map((thema, themaIndex) => (
                          <li key={themaIndex} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="text-gray-700">{thema}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Enthaltene Materialien</h2>
              <ul className="space-y-3">
                {inhalte.materialien.map((material, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700">{material}</span>
                  </li>
                ))}
              </ul>
            </div>

            {inhalte.voraussetzungen && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Voraussetzungen</h2>
                <ul className="space-y-2">
                  {inhalte.voraussetzungen.map((voraussetzung, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">{voraussetzung}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {inhalte.zielgruppe && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Zielgruppe</h2>
                <div className="grid grid-cols-2 gap-3">
                  {inhalte.zielgruppe.map((gruppe, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-700">{gruppe}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {schulung.anmeldungen.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Angemeldete Teilnehmer ({schulung.anmeldungen.length})
                </h2>
                <div className="space-y-3">
                  {schulung.anmeldungen.map((anmeldung) => (
                    <div key={anmeldung.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mr-3">
                          {anmeldung.teilnehmer.vorname[0]}{anmeldung.teilnehmer.nachname[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {anmeldung.teilnehmer.vorname} {anmeldung.teilnehmer.nachname}
                          </div>
                          <div className="text-sm text-gray-600">
                            {anmeldung.teilnehmer.firma || anmeldung.teilnehmer.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          anmeldung.status === 'gebucht' ? 'bg-green-100 text-green-800' :
                          anmeldung.status === 'reserviert' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {anmeldung.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          anmeldung.bezahlstatus === 'bezahlt' ? 'bg-green-100 text-green-800' :
                          anmeldung.bezahlstatus === 'offen' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {anmeldung.bezahlstatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Eckdaten</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Zeitraum</dt>
                  <dd className="text-gray-900 font-medium">
                    {formatDate(schulung.startDatum)} - {formatDate(schulung.endDatum)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Dauer</dt>
                  <dd className="text-gray-900 font-medium">{schulung.dauer} Tage</dd>
                </div>
                {schulung.ort && (
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Ort</dt>
                    <dd className="text-gray-900 font-medium">{schulung.ort}</dd>
                  </div>
                )}
                {schulung.raum && (
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Raum</dt>
                    <dd className="text-gray-900 font-medium">{schulung.raum}</dd>
                  </div>
                )}
                {schulung.trainer && (
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Trainer</dt>
                    <dd className="text-gray-900 font-medium">{schulung.trainer}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Auslastung</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Angemeldet</span>
                    <span className="font-medium text-gray-900">
                      {schulung._count.anmeldungen} / {schulung.maxTeilnehmer}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        auslastung >= 100 ? 'bg-red-500' :
                        auslastung >= 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(auslastung, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Freie Plätze</div>
                  <div className={`text-2xl font-bold ${
                    freiePlaetze === 0 ? 'text-red-600' :
                    freiePlaetze <= 2 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {freiePlaetze}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technische Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Controller</dt>
                  <dd className="text-gray-900">{herstellerInfo.controller}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Software</dt>
                  <dd className="text-gray-900">{herstellerInfo.software}</dd>
                </div>
                {herstellerInfo.besonderheiten.length > 0 && (
                  <div>
                    <dt className="text-sm text-gray-600 mb-2">Besonderheiten</dt>
                    <dd className="space-y-1">
                      {herstellerInfo.besonderheiten.map((besonderheit, index) => (
                        <div key={index} className="text-sm text-gray-700 flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {besonderheit}
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktionen</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Teilnehmer hinzufügen
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Schulung bearbeiten
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Email an Teilnehmer
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Zertifikate generieren
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiken</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Anmeldungen</dt>
                  <dd className="text-gray-900 font-medium">{schulung._count.anmeldungen}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Zertifikate</dt>
                  <dd className="text-gray-900 font-medium">{schulung._count.zertifikate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Auslastung</dt>
                  <dd className="text-gray-900 font-medium">{Math.round(auslastung)}%</dd>
                </div>
                {schulung.calendarEventId && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mit Google Calendar synchronisiert
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
