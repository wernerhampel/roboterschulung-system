import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ROBTEC Training Management',
  description: 'Verwaltung von Roboterschulungen und Zertifikaten',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">ROBTEC Training Management</h1>
              <p className="text-sm text-blue-100">Schulungsverwaltung & Zertifizierung</p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-800 text-white mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} ROBTEC GmbH. Alle Rechte vorbehalten.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
