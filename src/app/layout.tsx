// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "20minCoach PoC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Top bar morada */}
        <div className="h-2 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800" />
        {children}
      </body>
    </html>
  );
}
