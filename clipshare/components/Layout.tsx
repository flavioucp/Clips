import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        isAuthenticated={!!user}
        userName={user?.name}
        onLogout={handleLogout}
      />
      
      <main className="min-h-[calc(100vh-64px)]">
        {title && (
          <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ClipShare</h3>
              <p className="text-slate-400 text-sm">
                La plataforma moderna para compartir tus mejores clips
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/terms" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-sm text-slate-400">
                support@clipshare.com
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 ClipShare. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
