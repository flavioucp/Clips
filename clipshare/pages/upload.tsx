// Página de upload de clips
import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Upload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    privacy: 'PUBLIC',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'image/gif'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Allowed: mp4, webm, mov, gif');
        return;
      }

      // Validar tamaño (200MB max)
      if (selectedFile.size > 200 * 1024 * 1024) {
        setError('File too large. Maximum: 200MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('privacy', formData.privacy);

      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          router.push(`/clip/${response.clip.id}`);
        } else {
          const response = JSON.parse(xhr.responseText);
          setError(response.error || 'Upload failed');
          setUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed');
        setUploading(false);
      });

      xhr.open('POST', '/api/clips/upload');
      xhr.send(formDataToSend);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Clip - ClipShare</title>
      </Head>

      <main className="min-h-screen bg-slate-900">
        {/* Navigation */}
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-white">
              ClipShare
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-slate-800 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Upload Your Clip</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-900 text-red-100 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-white mb-2 font-bold">Video/GIF File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.webm,.mov,.gif"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-indigo-600 transition text-slate-400 disabled:opacity-50"
                >
                  {file ? `📁 ${file.name}` : '📤 Click to select file (max 200MB)'}
                </button>
              </div>

              {/* Progress */}
              {uploading && progress > 0 && (
                <div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">{Math.round(progress)}%</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-white mb-2 font-bold">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white mb-2 font-bold">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={1000}
                  disabled={uploading}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white mb-2 font-bold">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="gaming, funny, music"
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-white mb-2 font-bold">Privacy</label>
                <select
                  name="privacy"
                  value={formData.privacy}
                  onChange={handleInputChange}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
                >
                  <option value="PUBLIC">Public (visible to everyone)</option>
                  <option value="PRIVATE">Private (only you can see)</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 transition"
              >
                {uploading ? `Uploading... ${Math.round(progress)}%` : 'Upload Clip'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
