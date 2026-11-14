import React from 'react';
import { SkipLink } from '@/components/layout/SkipLink';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: '50 · Portal de Calificaciones',
  description: 'Sistema accesible y seguro para registro y consulta de calificaciones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AuthProvider>
          <SkipLink />
          <Header />
          <main
            id="contenido-principal"
            tabIndex={-1}
            style={{
              flex: 1,
              maxWidth: '72rem',
              width: '100%',
              margin: '0 auto',
              padding: '2rem 1.5rem',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
