import { validateCertificate, logValidation } from '@/lib/db';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function ValidatePage({
  searchParams,
}: {
  searchParams: { hash?: string };
}) {
  const hash = searchParams.hash;
  let certificate = null;
  let error = null;

  if (hash) {
    try {
      // Get IP and User Agent for logging
      const headersList = headers();
      const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
      const userAgent = headersList.get('user-agent') || 'unknown';

      certificate = await validateCertificate(hash);

      // Log the validation attempt
      await logValidation(
        certificate?.id || null,
        hash,
        !!certificate,
        ipAddress,
        userAgent
      );

      if (!certificate) {
        error = 'Zertifikat nicht gefunden oder ungültig';
      }
    } catch (err) {
      console.error('Validation error:', err);
      error = 'Ein Fehler ist bei der Validierung aufgetreten';
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Zertifikats-Validierung
        </h1>

        {!hash && (
          <form action="/validate" method="GET" className="space-y-6">
            <div>
              <label htmlFor="hash" className="label">
                Validierungscode eingeben
              </label>
              <input
                type="text"
                id="hash"
                name="hash"
                className="input"
                placeholder="Geben Sie den Validierungscode ein..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Der Validierungscode befindet sich im QR-Code des Zertifikats oder kann manuell eingegeben werden.
              </p>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Zertifikat validieren
            </button>
          </form>
        )}

        {hash && certificate && (
          <div className="space-y-6">
            <div className="alert alert-success">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">Zertifikat ist gültig! ✓</h3>
                  <p>Dieses Zertifikat wurde erfolgreich verifiziert und ist authentisch.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Zertifikatsdetails</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Zertifikatsnummer</p>
                  <p className="text-lg font-mono text-gray-900">{certificate.zertifikat_nummer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Ausstellungsdatum</p>
                  <p className="text-lg text-gray-900">
                    {format(new Date(certificate.ausstellungsdatum), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 font-semibold mb-2">Teilnehmer</p>
                <p className="text-xl font-bold text-gray-900">
                  {certificate.vorname} {certificate.nachname}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 font-semibold mb-2">Schulung</p>
                <p className="text-lg font-bold text-gray-900">{certificate.schulung_titel}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-success">{certificate.schulung_typ}</span>
                  <span className="badge badge-success">{certificate.hersteller}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 font-semibold mb-2">Schulungszeitraum</p>
                <p className="text-gray-900">
                  {format(new Date(certificate.start_datum), 'dd. MMMM yyyy', { locale: de })} bis{' '}
                  {format(new Date(certificate.end_datum), 'dd. MMMM yyyy', { locale: de })}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="/validate" className="btn btn-secondary flex-1">
                Neues Zertifikat prüfen
              </a>
              <button onClick={() => window.print()} className="btn btn-primary flex-1">
                Validierung drucken
              </button>
            </div>
          </div>
        )}

        {hash && error && (
          <div className="space-y-6">
            <div className="alert alert-error">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">Zertifikat nicht gültig</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Mögliche Gründe:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Der Validierungscode ist falsch oder wurde inkorrekt eingegeben
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Das Zertifikat wurde widerrufen oder ist abgelaufen
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Das Zertifikat wurde nicht von ROBTEC GmbH ausgestellt
                </li>
              </ul>
            </div>

            <div className="text-center">
              <a href="/validate" className="btn btn-primary">
                Erneut versuchen
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Bei Fragen zur Zertifikatsvalidierung wenden Sie sich bitte an{' '}
          <a href="mailto:hampel@robtec.de" className="text-blue-600 hover:underline">
            hampel@robtec.de
          </a>
        </p>
      </div>
    </div>
  );
}

export default ValidatePage;
