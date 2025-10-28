'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface VerificationResult {
  valid: boolean;
  expired?: boolean;
  revoked?: boolean;
  message?: string;
  error?: string;
  zertifikat?: {
    zertifikatNummer: string;
    ausstellungsdatum: string;
    gueltigBis: string;
    teilnehmer: {
      name: string;
      firma?: string;
    };
    schulung: {
      titel: string;
      typ: string;
      hersteller: string;
      startDatum: string;
      endDatum: string;
      dauer: number;
    };
  };
}

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const hash = searchParams?.get('hash');

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && hash) {
      verifyZertifikat();
    } else {
      setLoading(false);
    }
  }, [id, hash]);

  async function verifyZertifikat() {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/verify/${id}?hash=${hash}`);
      const data = await response.json();
      
      setResult(data);
    } catch (error) {
      setResult({
        valid: false,
        error: 'Verbindungsfehler'
      });
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verifiziere Zertifikat...</p>
        </div>
      </div>
    );
  }

  if (!id || !hash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ungültiger Link</h1>
          <p className="text-gray-600">
            Dieser Verifizierungs-Link ist ungültig. Bitte scannen Sie den QR-Code auf dem Zertifikat erneut.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  // Ungültiges Zertifikat
  if (!result.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Zertifikat ungültig</h1>
          <p className="text-gray-600 mb-4">
            {result.error || result.message || 'Dieses Zertifikat konnte nicht verifiziert werden.'}
          </p>
          {result.revoked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              ⚠️ Dieses Zertifikat wurde widerrufen
            </div>
          )}
        </div>
      </div>
    );
  }

  // Gültiges Zertifikat
  const z = result.zertifikat!;
  const isExpired = result.expired;

  return (
    <div className={`min-h-screen ${isExpired ? 'bg-gradient-to-br from-yellow-50 to-orange-100' : 'bg-gradient-to-br from-green-50 to-emerald-100'} p-4`}>
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{isExpired ? '⚠️' : '✅'}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isExpired ? 'Zertifikat abgelaufen' : 'Zertifikat gültig'}
          </h1>
          <p className="text-gray-600">
            Offizielles ROBTEC Schulungszertifikat verifiziert
          </p>
        </div>

        {/* Zertifikat Details */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Status Banner */}
          <div className={`${isExpired ? 'bg-yellow-500' : 'bg-green-500'} text-white py-3 px-6 text-center font-semibold`}>
            {isExpired ? '⚠️ ABGELAUFEN' : '✅ GÜLTIG'}
          </div>

          <div className="p-8">
            {/* Zertifikat Nummer */}
            <div className="text-center mb-8">
              <div className="text-sm text-gray-600 mb-1">Zertifikat-Nummer</div>
              <div className="text-2xl font-bold text-blue-600">{z.zertifikatNummer}</div>
            </div>

            {/* Teilnehmer */}
            <div className="border-t border-b py-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Teilnehmer</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-32">Name:</span>
                  <span className="font-medium text-gray-900">{z.teilnehmer.name}</span>
                </div>
                {z.teilnehmer.firma && (
                  <div className="flex">
                    <span className="text-gray-600 w-32">Firma:</span>
                    <span className="font-medium text-gray-900">{z.teilnehmer.firma}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Schulung */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schulung</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-32">Titel:</span>
                  <span className="font-medium text-gray-900">{z.schulung.titel}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Hersteller:</span>
                  <span className="font-medium text-gray-900">{z.schulung.hersteller}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Typ:</span>
                  <span className="font-medium text-gray-900">{z.schulung.typ}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Zeitraum:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(z.schulung.startDatum)} - {formatDate(z.schulung.endDatum)}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Dauer:</span>
                  <span className="font-medium text-gray-900">
                    {z.schulung.dauer} Tag{z.schulung.dauer !== 1 ? 'e' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Gültigkeit */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gültigkeit</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-32">Ausgestellt:</span>
                  <span className="font-medium text-gray-900">{formatDate(z.ausstellungsdatum)}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Gültig bis:</span>
                  <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                    {formatDate(z.gueltigBis)}
                  </span>
                </div>
              </div>
            </div>

            {/* Warnung bei Ablauf */}
            {isExpired && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-800 mb-1">
                      Zertifikat abgelaufen
                    </div>
                    <div className="text-sm text-yellow-700">
                      Dieses Zertifikat ist seit dem {formatDate(z.gueltigBis)} abgelaufen. 
                      Für eine Auffrischung kontaktieren Sie bitte ROBTEC GmbH.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} ROBTEC GmbH - Schulungszentrum für Roboterprogrammierung</p>
          <p className="mt-2">
            Bei Fragen zur Verifizierung kontaktieren Sie uns unter{' '}
            <a href="mailto:info@robtec.de" className="text-blue-600 hover:underline">
              info@robtec.de
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
