import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Zertifikats-Validierung
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Überprüfen Sie die Echtheit von ROBTEC Schulungszertifikaten
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/validate" className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR-Code scannen</h3>
              <p className="text-sm text-gray-600">Scannen Sie den QR-Code auf dem Zertifikat</p>
            </div>
          </Link>

          <Link href="/validate" className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Code eingeben</h3>
              <p className="text-sm text-gray-600">Geben Sie den Validierungscode manuell ein</p>
            </div>
          </Link>
        </div>

        <Link href="/validate" className="btn btn-primary">
          Jetzt validieren
        </Link>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wie funktioniert die Validierung?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="flex items-center mb-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">1</span>
                <h4 className="font-semibold text-gray-900">Scannen</h4>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Scannen Sie den QR-Code auf dem Zertifikat mit Ihrem Smartphone oder geben Sie den Code manuell ein.
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">2</span>
                <h4 className="font-semibold text-gray-900">Prüfen</h4>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Das System prüft die Echtheit des Zertifikats anhand des verschlüsselten Validierungscodes.
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">3</span>
                <h4 className="font-semibold text-gray-900">Bestätigen</h4>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Sie erhalten sofort eine Bestätigung über die Gültigkeit des Zertifikats mit allen relevanten Details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
