import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            404
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            Schulung nicht gefunden
          </h2>
          <p className="text-gray-500">
            Die gesuchte Schulung existiert nicht oder wurde entfernt.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/schulungen"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Zurück zur Schulungsübersicht
          </Link>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Zum Dashboard
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Wenn Sie glauben, dass dies ein Fehler ist,</p>
          <p>kontaktieren Sie bitte den Administrator.</p>
        </div>
      </div>
    </div>
  );
}
