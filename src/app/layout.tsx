// src/app/layout.tsx
import './globals.css'
import { AuthProvider } from '../auth/AuthProvider' 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
