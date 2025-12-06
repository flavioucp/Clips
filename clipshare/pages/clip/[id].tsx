// Página de detalles de clip
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ClipDetail {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  viewsCount: number;
  privacy: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
  };
  tags: string[];
  comments: any[];
  _count: {
    likes: number;
    comments: number;
  };
}

export default function ClipDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [clip, setClip] = useState<ClipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchClip = async () => {
      try {
        const res = await fetch(`/api/clips/detail?id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch clip');
        const data = await res.json();
        setClip(data.clip);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchClip();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/clips/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setLiked(!liked);
      }
    } catch (err) {
      console.error('Error liking clip:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!clip) return <p>Clip not found</p>;

  return (
    <>
      <Head>
        <title>{clip.title} - ClipShare</title>
        <meta name="description" content={clip.description} />
        <meta property="og:title" content={clip.title} />
        <meta property="og:description" content={clip.description} />
        <meta property="og:image" content={clip.thumbnailUrl} />
        <meta property="og:type" content="video.other" />
      </Head>

      <main className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Video Player */}
          <div className="mb-8 bg-slate-800 rounded-lg overflow-hidden">
            <video
              src={clip.fileUrl}
              controls
              poster={clip.thumbnailUrl}
              className="w-full h-auto"
            />
          </div>

          {/* Info */}
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{clip.title}</h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Image
                  src={clip.user.avatarUrl || 'https://via.placeholder.com/48'}
                  alt={clip.user.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-white">{clip.user.name}</p>
                  {clip.user.bio && <p className="text-slate-400 text-sm">{clip.user.bio}</p>}
                </div>
              </div>

              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-lg transition ${
                  liked
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                ❤️ {clip._count.likes}
              </button>
            </div>

            {clip.description && (
              <p className="text-slate-300 mb-4">{clip.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {clip.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${tag}`}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="flex gap-6 text-slate-300 text-sm">
              <span>👁 {clip.viewsCount} views</span>
              <span>💬 {clip._count.comments} comments</span>
              <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>
            {clip.comments.length === 0 ? (
              <p className="text-slate-400">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {clip.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-indigo-600 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={comment.user.avatarUrl || 'https://via.placeholder.com/32'}
                        alt={comment.user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-bold text-white">{comment.user.name}</span>
                    </div>
                    <p className="text-slate-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
