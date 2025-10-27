'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NeueSchulungModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SchulungFormData {
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
}

export default function NeueSchulungModal({ isOpen, onClose }: NeueSchulungModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SchulungFormData>({
    titel: '',
    beschreibung: '',
    typ: 'grundlagen',
    hersteller: 'kuka',
    startDatum: '',
    endDatum: '',
    dauer: 1,
    maxTeilnehmer: 6,
    preis: 0,
    status: 'geplant',
    ort: '',
    raum: '',
    trainer: ''
  });

  function handleChange(field: keyof SchulungFormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    
    // Auto-calculate dauer when dates change
    if (field === 'startDatum' || field === 'endDatum') {
      const newData = { ...formData, [field]: value };
      if (newData.startDatum && newData.endDatum) {
        const start = new Date(newData.startDatum);
        const end = new Date(newData.endDatum);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, dauer: diffDays }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validierung
    if (!formData.titel.trim()) {
      setError('Bitte Titel eingeben');
      return;
    }
    if (!formData.startDatum) {
      setError('Bitte Startdatum eingeben');
      return;
    }
    if (!formData.endDatum) {
      setError('Bitte Enddatum eingeben');
      return;
    }
    if (new Date(formData.startDatum) > new Date(formData.endDatum)) {
      setError('Enddatum muss nach Startdatum liegen');
      return;
    }
    if (formData.maxTeilnehmer < 1) {
      setError('Mindestens 1 Teilnehmer erforderlich');
      return;
    }
    if (formData.preis < 0) {
      setError('Preis kann nicht negativ sein');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/schulungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Erstellen');
      }

      const schulung = await response.json();
      
      // Redirect to new schulung
      router.push(`/schulungen/${schulung.id}`);
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Neue Schulung erstellen</h2>
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

          {/* Grunddaten */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Grunddaten</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titel}
                onChange={(e) => handleChange('titel', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. KUKA KRC4 Grundlagen"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={formData.beschreibung}
                onChange={(e) => handleChange('beschreibung', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beschreibung der Schulung..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.typ}
                  onChange={(e) => handleChange('typ', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="grundlagen">Grundlagen</option>
                  <option value="praxis">Praxis</option>
                  <option value="online">Online</option>
                  <option value="sonstige">Sonstige</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hersteller <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hersteller}
                  onChange={(e) => handleChange('hersteller', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="kuka">KUKA</option>
                  <option value="abb">ABB</option>
                  <option value="mitsubishi">Mitsubishi</option>
                  <option value="universal_robots">Universal Robots</option>
                  <option value="sonstige">Sonstige</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="geplant">Geplant</option>
                  <option value="bestaetigt">Bestätigt</option>
                  <option value="laufend">Läuft</option>
                  <option value="abgeschlossen">Abgeschlossen</option>
                  <option value="abgesagt">Abgesagt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datum & Dauer */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Datum & Dauer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startdatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDatum}
                  onChange={(e) => handleChange('startDatum', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enddatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDatum}
                  onChange={(e) => handleChange('endDatum', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dauer (Tage) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.dauer}
                  onChange={(e) => handleChange('dauer', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Wird automatisch berechnet</p>
              </div>
            </div>
          </div>

          {/* Kapazität & Preis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Kapazität & Preis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Teilnehmer <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxTeilnehmer}
                  onChange={(e) => handleChange('maxTeilnehmer', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preis (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.preis}
                  onChange={(e) => handleChange('preis', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 = Kostenlos"
                />
              </div>
            </div>
          </div>

          {/* Ort & Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Ort & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort
                </label>
                <input
                  type="text"
                  value={formData.ort}
                  onChange={(e) => handleChange('ort', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. ROBTEC GmbH, Mainburg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raum
                </label>
                <input
                  type="text"
                  value={formData.raum}
                  onChange={(e) => handleChange('raum', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Schulungsraum 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer
                </label>
                <input
                  type="text"
                  value={formData.trainer}
                  onChange={(e) => handleChange('trainer', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Name des Trainers"
                />
              </div>
            </div>
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
                  Erstelle...
                </>
              ) : (
                <>
                  ✨ Schulung erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
