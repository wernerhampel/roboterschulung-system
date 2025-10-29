import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const prisma = new PrismaClient();

async function getTemplates() {
  const templates = await prisma.schulungsTemplate.findMany({
    orderBy: [
      { hersteller: 'asc' },
      { typ: 'asc' }
    ]
  });
  
  await prisma.$disconnect();
  return templates;
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  // Gruppiere nach Hersteller
  const templatesByHersteller = templates.reduce((acc, template) => {
    if (!acc[template.hersteller]) {
      acc[template.hersteller] = [];
    }
    acc[template.hersteller].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Schulungs-Templates
              </h1>
              <p className="mt-2 text-gray-600">
                Verwalten Sie wiederverwendbare Schulungsinhalte
              </p>
            </div>
            <Link
              href="/templates/neu"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Neues Template
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Gesamt Templates</div>
            <div className="text-3xl font-bold text-gray-900">{templates.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Hersteller</div>
            <div className="text-3xl font-bold text-blue-600">
              {Object.keys(templatesByHersteller).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Grundlagen</div>
            <div className="text-3xl font-bold text-green-600">
              {templates.filter(t => t.typ.toLowerCase() === 'grundlagen').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Fortgeschritten</div>
            <div className="text-3xl font-bold text-orange-600">
              {templates.filter(t => t.typ.toLowerCase() === 'fortgeschritten').length}
            </div>
          </div>
        </div>

        {/* Templates nach Hersteller gruppiert */}
        {Object.keys(templatesByHersteller).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Templates vorhanden
            </h3>
            <p className="text-gray-600 mb-6">
              Erstellen Sie Ihr erstes Schulungs-Template
            </p>
            <Link
              href="/templates/neu"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Erstes Template erstellen
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(templatesByHersteller).map(([hersteller, herstellerTemplates]) => (
              <div key={hersteller} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    🤖 {hersteller.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {herstellerTemplates.length} {herstellerTemplates.length === 1 ? 'Template' : 'Templates'}
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {herstellerTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {template.name}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              template.typ.toLowerCase() === 'grundlagen' ? 'bg-green-100 text-green-800' :
                              template.typ.toLowerCase() === 'fortgeschritten' ? 'bg-orange-100 text-orange-800' :
                              template.typ.toLowerCase() === 'wartung' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {template.typ}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {template.beschreibung}
                          </p>

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <span>🎯</span>
                              <span>{(template.lernziele as any[])?.length || 0} Lernziele</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>📅</span>
                              <span>{(template.agenda as any[])?.length || 0} Tage</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>📚</span>
                              <span>{(template.materialien as any[])?.length || 0} Materialien</span>
                            </div>
                            {template.standardFragen && (
                              <div className="flex items-center gap-1">
                                <span>❓</span>
                                <span>{(template.standardFragen as any[])?.length || 0} Prüfungsfragen</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 text-xs text-gray-400">
                            Aktualisiert: {formatDate(template.updatedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/templates/${template.id}`}
                            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Ansehen
                          </Link>
                          <Link
                            href={`/templates/${template.id}/bearbeiten`}
                            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Bearbeiten
                          </Link>
                          <Link
                            href={`/schulungen/neu?template=${template.id}`}
                            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Schulung erstellen
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Was sind Schulungs-Templates?
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>
              Templates sind wiederverwendbare Vorlagen für Schulungen mit vorgefertigten Inhalten:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Lernziele und Schulungsziele</li>
              <li>Detaillierte Tagesagenda</li>
              <li>Voraussetzungen und Zielgruppen</li>
              <li>Benötigte Materialien</li>
              <li>Prüfungsfragen (optional)</li>
            </ul>
            <p className="mt-3 font-medium">
              Beim Erstellen einer neuen Schulung können Sie ein Template auswählen und die Inhalte
              individuell anpassen!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
