import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';

interface ClipCardProps {
  id: string;
  title: string;
  thumbnail: string;
  user: {
    id: string;
    name: string;
  };
  likes: number;
  comments: number;
  views: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export function ClipCard({
  id,
  title,
  thumbnail,
  user,
  likes,
  comments,
  views,
  isLiked = false,
  onLike,
}: ClipCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (onLike) {
      onLike(id);
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  return (
    <Link href={`/clip/${id}`}>
      <div className="group cursor-pointer rounded-lg overflow-hidden bg-slate-900 hover:shadow-lg transition-shadow duration-300">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-slate-800 overflow-hidden">
          <Image
            src={thumbnail || 'https://via.placeholder.com/320x180?text=No+Thumbnail'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <div className="w-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-8 border-t-white ml-1" />
            </div>
          </div>
          
          {/* Views Badge */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views > 1000 ? `${(views / 1000).toFixed(1)}K` : views}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {title}
          </h3>

          {/* User Info */}
          <Link href={`/user/${user.id}`} onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-slate-400 hover:text-slate-200 mb-3 truncate">
              {user.name}
            </p>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pb-3 border-b border-slate-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleLike();
              }}
              className={`flex items-center gap-1 hover:text-white transition-colors ${
                liked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <div className="flex items-center gap-1 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" />
              {comments}
            </div>
          </div>

          {/* Share Button */}
          <div className="pt-3 flex justify-end">
            <button
              onClick={(e) => {
                e.preventDefault();
                const url = `${window.location.origin}/clip/${id}`;
                navigator.clipboard.writeText(url);
              }}
              className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
