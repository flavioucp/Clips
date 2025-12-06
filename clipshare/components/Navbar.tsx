import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Menu, X, Upload, LogOut, Home, Search } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function Navbar({ isAuthenticated, userName, onLogout }: NavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">▶</span>
            </div>
            <span className="font-bold text-xl text-white hidden sm:inline">ClipShare</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                router.pathname === '/'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              Inicio
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/upload"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    router.pathname === '/upload'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Subir
                </Link>

                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                  <div className="text-sm">
                    <p className="text-slate-400">Hola,</p>
                    <p className="text-white font-semibold">{userName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-800 pt-4">
            <Link
              href="/"
              className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/upload"
                  className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Subir video
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Mi dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
