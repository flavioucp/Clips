/**
 * Archivo _app.tsx de Next.js
 * Wrapper global para todas las páginas
 */

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Verificar autenticación al cargar
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!res.ok) {
          // No autenticado
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, []);

  return <Component {...pageProps} />;
}
