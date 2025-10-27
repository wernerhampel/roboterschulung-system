export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ROBTEC Training Management</h1>
            <p className="text-blue-100 text-sm mt-1">Schulungsverwaltung & Zertifizierung</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Version 1.4.0</div>
            <div className="text-xs text-blue-200 mt-1">Calendar Sync Ready</div>
          </div>
        </div>
      </div>
    </header>
  );
}
