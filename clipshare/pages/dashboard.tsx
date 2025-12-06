// Dashboard para usuarios autenticados
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - ClipShare</title>
      </Head>

      <main className="min-h-screen bg-slate-900">
        {/* Navigation */}
        <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              ClipShare
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/upload"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                Upload Clip
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card: Upload */}
            <Link
              href="/upload"
              className="bg-slate-800 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📤</div>
              <h2 className="text-xl font-bold text-white mb-2">Upload Clip</h2>
              <p className="text-slate-400">Share your best video moments</p>
            </Link>

            {/* Card: My Clips */}
            <Link
              href="/my-clips"
              className="bg-slate-800 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-xl font-bold text-white mb-2">My Clips</h2>
              <p className="text-slate-400">View and manage your uploads</p>
            </Link>

            {/* Card: Profile */}
            <Link
              href="/profile"
              className="bg-slate-800 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-xl font-bold text-white mb-2">Profile</h2>
              <p className="text-slate-400">Edit your profile and settings</p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="mt-12 bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Welcome!</h2>
            <p className="text-slate-300">
              Ready to share your next great clip? Click the Upload button above to get started.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
