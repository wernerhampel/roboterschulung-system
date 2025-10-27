import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ROBTEC Zertifikats-Validierung',
  description: 'Validierung von ROBTEC Schulungszertifikaten',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-gray-900">ROBTEC GmbH</h1>
              <p className="text-sm text-gray-600">Zertifikats-Validierung</p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-12">
            {children}
          </main>
          <footer className="bg-white mt-12 border-t">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} ROBTEC GmbH. Alle Rechte vorbehalten.</p>
              <p className="mt-2">
                <a href="https://robtec.de" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  www.robtec.de
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
