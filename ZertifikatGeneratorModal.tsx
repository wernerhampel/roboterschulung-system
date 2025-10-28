'use client';

import { useState } from 'react';

interface ZertifikatGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  schulungId: string;
  schulungTitel: string;
  teilnehmer: Array<{
    id: string;
    vorname: string;
    nachname: string;
    firma?: string;
    hasZertifikat?: boolean;
  }>;
}

export default function ZertifikatGeneratorModal({
  isOpen,
  onClose,
  schulungId,
  schulungTitel,
  teilnehmer
}: ZertifikatGeneratorModalProps) {
  const [selectedTeilnehmer, setSelectedTeilnehmer] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  function toggleTeilnehmer(id: string) {
    if (selectedTeilnehmer.includes(id)) {
      setSelectedTeilnehmer(selectedTeilnehmer.filter(t => t !== id));
    } else {
      setSelectedTeilnehmer([...selectedTeilnehmer, id]);
    }
  }

  function selectAll() {
    const available = teilnehmer.filter(t => !t.hasZertifikat).map(t => t.id);
    setSelectedTeilnehmer(available);
  }

  function deselectAll() {
    setSelectedTeilnehmer([]);
  }

  async function handleGenerate() {
    if (selectedTeilnehmer.length === 0) {
      alert('Bitte mindestens einen Teilnehmer auswählen');
      return;
    }

    try {
      setGenerating(true);
      setProgress(0);
      setResults([]);

      const total = selectedTeilnehmer.length;
      const newResults: any[] = [];

      for (let i = 0; i < selectedTeilnehmer.length; i++) {
        const teilnehmerId = selectedTeilnehmer[i];
        
        try {
          const response = await fetch('/api/zertifikate/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schulungId, teilnehmerId })
          });

          const data = await response.json();

          if (response.ok) {
            // Download PDF
            const pdfBlob = base64ToBlob(data.pdf, 'application/pdf');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.filename;
            a.click();
            URL.revokeObjectURL(url);

            newResults.push({
              teilnehmerId,
              success: true,
              filename: data.filename
            });
          } else {
            newResults.push({
              teilnehmerId,
              success: false,
              error: data.error
            });
          }
        } catch (error) {
          newResults.push({
            teilnehmerId,
            success: false,
            error: 'Netzwerkfehler'
          });
        }

        setProgress(Math.round(((i + 1) / total) * 100));
        setResults([...newResults]);
      }

      setGenerating(false);

    } catch (error) {
      console.error('Fehler:', error);
      setGenerating(false);
      alert('Fehler beim Generieren');
    }
  }

  function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  function getTeilnehmerName(id: string): string {
    const t = teilnehmer.find(t => t.id === id);
    return t ? `${t.vorname} ${t.nachname}` : '';
  }

  if (!isOpen) return null;

  const availableTeilnehmer = teilnehmer.filter(t => !t.hasZertifikat);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Zertifikate generieren</h2>
            <p className="text-sm text-gray-600 mt-1">{schulungTitel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={generating}
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!generating && results.length === 0 && (
            <>
              {/* Teilnehmer Auswahl */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Teilnehmer auswählen ({selectedTeilnehmer.length} ausgewählt)</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Alle auswählen
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={deselectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Alle abwählen
                    </button>
                  </div>
                </div>

                {availableTeilnehmer.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Alle Teilnehmer haben bereits ein Zertifikat
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                    {availableTeilnehmer.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeilnehmer.includes(t.id)}
                          onChange={() => toggleTeilnehmer(t.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {t.vorname} {t.nachname}
                          </div>
                          {t.firma && (
                            <div className="text-sm text-gray-500">{t.firma}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Aktionen */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={selectedTeilnehmer.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  🎓 {selectedTeilnehmer.length} Zertifikat{selectedTeilnehmer.length !== 1 ? 'e' : ''} generieren
                </button>
              </div>
            </>
          )}

          {/* Progress */}
          {generating && (
            <div className="py-8">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold">Generiere Zertifikate...</div>
                <div className="text-sm text-gray-600 mt-1">{progress}% abgeschlossen</div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {results.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {results.map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded ${
                        result.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span>{result.success ? '✅' : '❌'}</span>
                      <span className="text-sm">
                        {getTeilnehmerName(result.teilnehmerId)}
                        {result.success && ' - Download gestartet'}
                        {!result.success && ` - ${result.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ergebnisse */}
          {!generating && results.length > 0 && (
            <div className="py-4">
              <h3 className="font-semibold mb-3">Ergebnisse</h3>
              <div className="space-y-2 mb-6">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-3 rounded ${
                      result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <span className="text-xl">{result.success ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <div className="font-medium">
                        {getTeilnehmerName(result.teilnehmerId)}
                      </div>
                      {result.success && (
                        <div className="text-sm text-green-700">{result.filename}</div>
                      )}
                      {!result.success && (
                        <div className="text-sm text-red-700">{result.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4">
                  {results.filter(r => r.success).length} von {results.length} erfolgreich
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
