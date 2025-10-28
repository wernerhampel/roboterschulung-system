import type { Metadata } from "next";
import "./globals.css";

const APP_VERSION = "1.4.1";

export const metadata: Metadata = {
  title: "ROBTEC Training Management",
  description: "Schulungsverwaltung & Zertifizierung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex flex-col min-h-screen">
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">ROBTEC Training Management</h1>
                <p className="text-blue-100 text-sm mt-1">Schulungsverwaltung & Zertifizierung</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 max-w-7xl mx-auto px-8 py-8 w-full">
          {children}
        </main>

        <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                © {new Date().getFullYear()} ROBTEC GmbH - Alle Rechte vorbehalten
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">Version {APP_VERSION}</span>
                <span className="text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Calendar Sync Ready
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
