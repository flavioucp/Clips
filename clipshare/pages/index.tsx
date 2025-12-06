import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { ClipCard } from '@/components/ClipCard';
import { Alert } from '@/components/Form';
import axios from 'axios';
import {
  Play,
  Zap,
  Users,
  Sparkles,
  Rocket,
  Shield,
  Smartphone,
} from 'lucide-react';

interface Clip {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  fileUrl: string;
  viewsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  tags: string[];
  _count: {
    likes: number;
    comments: number;
  };
}

export default function Home() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/clips/list');
      setClips(response.data.clips || []);
    } catch (err) {
      setError('Error al cargar los clips');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        {/* SEO Básico */}
        <title>
          ClipShare - Comparte Videos y GIFs | Plataforma de Clips Sociales
        </title>
        <meta
          name="description"
          content="ClipShare: La plataforma moderna para compartir videos cortos, GIFs y momentos especiales. Sube, descubre y comparte contenido visual con millones de usuarios."
        />
        <meta
          name="keywords"
          content="videos, GIFs, clips, compartir videos, red social, contenido viral, videos cortos"
        />
        <meta name="author" content="ClipShare" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="theme-color"
          content="#1e293b"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="ClipShare - Comparte Videos y GIFs"
        />
        <meta
          property="og:description"
          content="La plataforma moderna para compartir tus mejores momentos en video"
        />
        <meta property="og:url" content="https://clipshare.com" />
        <meta
          property="og:image"
          content="https://via.placeholder.com/1200x630"
        />
        <meta property="og:site_name" content="ClipShare" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="ClipShare - Comparte Videos y GIFs"
        />
        <meta
          name="twitter:description"
          content="Plataforma moderna para compartir videos cortos y GIFs"
        />

        {/* Canonical */}
        <link rel="canonical" href="https://clipshare.com" />

        {/* Mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>

      <Layout>
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Hero Section */}
          <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content */}
                <div className="text-white z-10">
                  <div className="inline-flex items-center gap-2 mb-6 bg-indigo-900 bg-opacity-50 px-4 py-2 rounded-full border border-indigo-500 border-opacity-30 hover:border-opacity-100 transition">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300">
                      Nueva forma de compartir
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Comparte tus mejores
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      momentos en video
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
                    Descubre una plataforma moderna para compartir clips, GIFs y
                    momentos especiales. Conecta con comunidades, haz viral tu
                    contenido y diviértete.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 rounded-lg font-semibold text-white transition transform hover:scale-105 active:scale-95"
                    >
                      <Rocket className="w-5 h-5" />
                      Comenzar Gratis
                    </Link>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-slate-500 hover:border-indigo-400 hover:bg-indigo-500 hover:bg-opacity-10 rounded-lg font-semibold text-white transition"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-700">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-indigo-400">
                        10K+
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400">
                        Usuarios
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-indigo-400">
                        50K+
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400">
                        Clips
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-indigo-400">
                        100K+
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400">
                        Visualizaciones
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="relative h-96 sm:h-full min-h-96 hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-2xl"></div>
                  <div className="relative h-full rounded-2xl overflow-hidden border border-slate-700 backdrop-blur-sm bg-slate-800 bg-opacity-50 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-20 h-20 mx-auto text-indigo-400 mb-4 opacity-50" />
                      <p className="text-slate-300">Tu contenido aquí</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-slate-800 bg-opacity-50 border-y border-slate-700">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  ¿Por qué elegir ClipShare?
                </h2>
                <p className="text-base sm:text-lg text-slate-300">
                  Características diseñadas para hacer brillar tu contenido
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    icon: Zap,
                    title: 'Súper Rápido',
                    description:
                      'Carga y comparte videos en segundos con nuestra infraestructura optimizada',
                  },
                  {
                    icon: Shield,
                    title: 'Seguro y Privado',
                    description:
                      'Tu contenido está protegido con encriptación de nivel empresarial',
                  },
                  {
                    icon: Smartphone,
                    title: 'Responsivo',
                    description:
                      'Funciona perfectamente en celulares, tablets y computadoras',
                  },
                  {
                    icon: Users,
                    title: 'Comunidad Global',
                    description:
                      'Conecta con millones de creadores de contenido en todo el mundo',
                  },
                  {
                    icon: Sparkles,
                    title: 'Edición Fácil',
                    description:
                      'Herramientas integradas para mejorar tus clips antes de publicar',
                  },
                  {
                    icon: Rocket,
                    title: 'Viralidad',
                    description:
                      'Algoritmo inteligente que ayuda tu contenido a alcanzar más personas',
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="relative group bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 hover:from-slate-600 hover:to-slate-700 transition border border-slate-600 hover:border-indigo-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition"></div>
                    <div className="relative z-10">
                      <feature.icon className="w-12 h-12 text-indigo-400 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-300 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Clips Feed Section */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Clips Populares
                </h2>
                <p className="text-slate-400">
                  Descubre el contenido más popular de nuestra comunidad
                </p>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                </div>
              )}
              {error && (
                <Alert
                  variant="error"
                  title="Error"
                  description={error}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {clips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    id={clip.id}
                    title={clip.title}
                    thumbnail={clip.thumbnailUrl}
                    user={clip.user}
                    likes={clip._count?.likes || 0}
                    comments={clip._count?.comments || 0}
                    views={clip.viewsCount}
                  />
                ))}
              </div>

              {clips.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Play className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">
                    No hay clips disponibles en este momento
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-700">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                ¿Listo para compartir?
              </h2>
              <p className="text-lg text-indigo-100 mb-8">
                Únete a miles de creadores compartiendo sus mejores momentos
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 hover:bg-slate-100 rounded-lg font-bold transition transform hover:scale-105 active:scale-95"
              >
                <Rocket className="w-5 h-5" />
                Crear Cuenta Gratis
              </Link>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
}
