'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lernziel {
  text: string;
}

interface AgendaTag {
  tag: number;
  titel: string;
  themen: string[];
}

interface Material {
  name: string;
  beschreibung: string;
}

export default function NeuesTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basis-Daten
  const [name, setName] = useState('');
  const [typ, setTyp] = useState('Grundlagen');
  const [hersteller, setHersteller] = useState('KUKA');
  const [beschreibung, setBeschreibung] = useState('');

  // Lernziele
  const [lernziele, setLernziele] = useState<Lernziel[]>([
    { text: '' }
  ]);

  // Agenda
  const [agenda, setAgenda] = useState<AgendaTag[]>([
    { tag: 1, titel: '', themen: [''] }
  ]);

  // Materialien
  const [materialien, setMaterialien] = useState<Material[]>([
    { name: '', beschreibung: '' }
  ]);

  const addLernziel = () => {
    setLernziele([...lernziele, { text: '' }]);
  };

  const updateLernziel = (index: number, text: string) => {
    const updated = [...lernziele];
    updated[index].text = text;
    setLernziele(updated);
  };

  const removeLernziel = (index: number) => {
    setLernziele(lernziele.filter((_, i) => i !== index));
  };

  const addAgendaTag = () => {
    setAgenda([...agenda, { tag: agenda.length + 1, titel: '', themen: [''] }]);
  };

  const updateAgendaTitel = (index: number, titel: string) => {
    const updated = [...agenda];
    updated[index].titel = titel;
    setAgenda(updated);
  };

  const addThema = (agendaIndex: number) => {
    const updated = [...agenda];
    updated[agendaIndex].themen.push('');
    setAgenda(updated);
  };

  const updateThema = (agendaIndex: number, themaIndex: number, text: string) => {
    const updated = [...agenda];
    updated[agendaIndex].themen[themaIndex] = text;
    setAgenda(updated);
  };

  const removeThema = (agendaIndex: number, themaIndex: number) => {
    const updated = [...agenda];
    updated[agendaIndex].themen = updated[agendaIndex].themen.filter((_, i) => i !== themaIndex);
    setAgenda(updated);
  };

  const removeAgendaTag = (index: number) => {
    const updated = agenda.filter((_, i) => i !== index);
    // Renummeriere Tags
    updated.forEach((tag, i) => tag.tag = i + 1);
    setAgenda(updated);
  };

  const addMaterial = () => {
    setMaterialien([...materialien, { name: '', beschreibung: '' }]);
  };

  const updateMaterial = (index: number, field: 'name' | 'beschreibung', value: string) => {
    const updated = [...materialien];
    updated[index][field] = value;
    setMaterialien(updated);
  };

  const removeMaterial = (index: number) => {
    setMaterialien(materialien.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validierung
    if (!name.trim()) {
      setError('Bitte geben Sie einen Namen ein');
      setLoading(false);
      return;
    }

    // Filtere leere Einträge
    const filteredLernziele = lernziele.filter(l => l.text.trim());
    const filteredAgenda = agenda
      .map(a => ({
        ...a,
        themen: a.themen.filter(t => t.trim())
      }))
      .filter(a => a.titel.trim() && a.themen.length > 0);
    const filteredMaterialien = materialien.filter(m => m.name.trim());

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          typ,
          hersteller,
          beschreibung,
          lernziele: filteredLernziele,
          agenda: filteredAgenda,
          materialien: filteredMaterialien
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const template = await response.json();
      router.push(`/templates/${template.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen des Templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/templates"
                className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
              >
                ← Zurück zu Templates
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Neues Template erstellen
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basis-Informationen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📝 Basis-Informationen
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template-Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. ABB IRC5 Grundlagenschulung"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schulungstyp *
                  </label>
                  <select
                    value={typ}
                    onChange={(e) => setTyp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Grundlagen">Grundlagen</option>
                    <option value="Fortgeschritten">Fortgeschritten</option>
                    <option value="Wartung">Wartung</option>
                    <option value="Individualschulung">Individualschulung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hersteller *
                  </label>
                  <select
                    value={hersteller}
                    onChange={(e) => setHersteller(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="KUKA">KUKA</option>
                    <option value="ABB">ABB</option>
                    <option value="FANUC">FANUC</option>
                    <option value="Siemens">Siemens</option>
                    <option value="Yaskawa">Yaskawa</option>
                    <option value="Universal Robots">Universal Robots</option>
                    <option value="Stäubli">Stäubli</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="DENSO">DENSO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={beschreibung}
                  onChange={(e) => setBeschreibung(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Allgemeine Beschreibung der Schulung..."
                />
              </div>
            </div>
          </div>

          {/* Lernziele */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                🎯 Lernziele
              </h2>
              <button
                type="button"
                onClick={addLernziel}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                + Lernziel hinzufügen
              </button>
            </div>

            <div className="space-y-3">
              {lernziele.map((lernziel, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={lernziel.text}
                    onChange={(e) => updateLernziel(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Lernziel ${index + 1}`}
                  />
                  {lernziele.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLernziel(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                📅 Agenda
              </h2>
              <button
                type="button"
                onClick={addAgendaTag}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                + Tag hinzufügen
              </button>
            </div>

            <div className="space-y-6">
              {agenda.map((tag, agendaIndex) => (
                <div key={agendaIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      Tag {tag.tag}
                    </span>
                    <input
                      type="text"
                      value={tag.titel}
                      onChange={(e) => updateAgendaTitel(agendaIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Titel des Tages"
                    />
                    {agenda.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAgendaTag(agendaIndex)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="ml-4 space-y-2">
                    {tag.themen.map((thema, themaIndex) => (
                      <div key={themaIndex} className="flex gap-2">
                        <span className="text-gray-400 mt-2">•</span>
                        <input
                          type="text"
                          value={thema}
                          onChange={(e) => updateThema(agendaIndex, themaIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Thema ${themaIndex + 1}`}
                        />
                        {tag.themen.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeThema(agendaIndex, themaIndex)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addThema(agendaIndex)}
                      className="ml-4 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      + Thema hinzufügen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materialien */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                📚 Materialien
              </h2>
              <button
                type="button"
                onClick={addMaterial}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                + Material hinzufügen
              </button>
            </div>

            <div className="space-y-4">
              {materialien.map((material, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Material-Name"
                    />
                    {materialien.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={material.beschreibung}
                    onChange={(e) => updateMaterial(index, 'beschreibung', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Beschreibung (optional)"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Aktions-Buttons */}
          <div className="flex justify-end gap-3">
            <Link
              href="/templates"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird erstellt...' : 'Template erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
