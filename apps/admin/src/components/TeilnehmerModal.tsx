'use client';

import { useState } from 'react';

interface TeilnehmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TeilnehmerFormData) => Promise<void>;
  schulungId: string;
}

export interface TeilnehmerFormData {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  firma?: string;
  position?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  land?: string;
  status?: string;
  bezahlstatus?: string;
  bemerkungen?: string;
}

export default function TeilnehmerModal({ isOpen, onClose, onSave, schulungId }: TeilnehmerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TeilnehmerFormData>({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    firma: '',
    position: '',
    strasse: '',
    plz: '',
    ort: '',
    land: 'DE',
    status: 'angemeldet',
    bezahlstatus: 'offen',
    bemerkungen: ''
  });

  function handleChange(field: keyof TeilnehmerFormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validierung
    if (!formData.vorname.trim()) {
      setError('Bitte Vorname eingeben');
      return;
    }
    if (!formData.nachname.trim()) {
      setError('Bitte Nachname eingeben');
      return;
    }
    if (!formData.email.trim()) {
      setError('Bitte E-Mail eingeben');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Bitte gültige E-Mail eingeben');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      
      // Reset form
      setFormData({
        vorname: '',
        nachname: '',
        email: '',
        telefon: '',
        firma: '',
        position: '',
        strasse: '',
        plz: '',
        ort: '',
        land: 'DE',
        status: 'angemeldet',
        bezahlstatus: 'offen',
        bemerkungen: ''
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Teilnehmer hinzufügen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Persönliche Daten */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Persönliche Daten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vorname}
                  onChange={(e) => handleChange('vorname', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nachname}
                  onChange={(e) => handleChange('nachname', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mustermann"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="max.mustermann@firma.de"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => handleChange('telefon', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+49 123 456789"
                />
              </div>
            </div>
          </div>

          {/* Firmendaten */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Firmendaten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma
                </label>
                <input
                  type="text"
                  value={formData.firma}
                  onChange={(e) => handleChange('firma', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mustermann GmbH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Techniker"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Adresse</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Straße
                </label>
                <input
                  type="text"
                  value={formData.strasse}
                  onChange={(e) => handleChange('strasse', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={formData.plz}
                    onChange={(e) => handleChange('plz', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={formData.ort}
                    onChange={(e) => handleChange('ort', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Musterstadt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land
                </label>
                <select
                  value={formData.land}
                  onChange={(e) => handleChange('land', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="IT">Italien</option>
                  <option value="FR">Frankreich</option>
                  <option value="NL">Niederlande</option>
                  <option value="BE">Belgien</option>
                  <option value="PL">Polen</option>
                  <option value="CZ">Tschechien</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status & Zahlung */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Status & Zahlung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anmeldungsstatus
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="angemeldet">Angemeldet</option>
                  <option value="bestaetigt">Bestätigt</option>
                  <option value="teilgenommen">Teilgenommen</option>
                  <option value="nicht_erschienen">Nicht erschienen</option>
                  <option value="storniert">Storniert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bezahlstatus
                </label>
                <select
                  value={formData.bezahlstatus}
                  onChange={(e) => handleChange('bezahlstatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="offen">Offen</option>
                  <option value="bezahlt">Bezahlt</option>
                  <option value="erstattet">Erstattet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bemerkungen */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bemerkungen
            </label>
            <textarea
              value={formData.bemerkungen}
              onChange={(e) => handleChange('bemerkungen', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional: Zusätzliche Informationen..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Speichere...
                </>
              ) : (
                <>
                  💾 Teilnehmer hinzufügen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
