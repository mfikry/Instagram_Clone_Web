"use client";

import { useState } from "react";
import Link from "next/link"; // <-- Import Link buat navigasi profil
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// Tambahin KTP buat Komentar biar TypeScript senyum
export interface CommentType {
  id: string;
  content: string;
  user: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface PostType {
  id: string;
  caption: string | null;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  media: {
    url: string;
    type: string;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

export default function PostCard({ post }: { post: PostType }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State baru untuk fitur Lihat Komentar
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<CommentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      await api.post(`/likes/${post.id}`);
    } catch {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      toast.error("Gagal menyukai postingan");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/comments/${post.id}`, { content: commentText });
      setCommentText("");
      setCommentsCount((prev) => prev + 1);
      toast.success("Komentar berhasil ditambahkan!");

      // Kalau tab komentar lagi kebuka, kita refresh datanya biar komentar baru langsung muncul
      if (showComments) {
        fetchComments();
      }
    } catch {
      toast.error("Gagal mengirim komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi buat narik data komentar dari backend
  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await api.get(`/comments/${post.id}`);
      setCommentsList(res.data.data);
    } catch {
      toast.error("Gagal memuat komentar");
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Fungsi pas tulisan "View all comments" diklik
  const toggleComments = () => {
    if (!showComments && commentsList.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  return (
    <div className="mb-6 w-full max-w-117.5 rounded-lg border border-gray-200 bg-white pb-4 sm:mb-8">
      {/* HEADER: Avatar & Username sekarang bisa diklik! */}
      <div className="flex items-center justify-between p-3">
        <Link
          href={`/${post.user.username}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-70"
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
            {post.user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={post.user.avatarUrl as string}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-yellow-400 to-fuchsia-600 text-xs font-bold text-white">
                {post.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {post.user.username}
          </span>
        </Link>
        <MoreHorizontal className="cursor-pointer text-gray-500" size={20} />
      </div>

      <div className="aspect-square w-full bg-gray-100">
        {post.media && post.media.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.media[0].url}
            alt="Post content"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between pb-2">
          <div className="flex gap-4">
            <Heart
              onClick={handleLike}
              size={24}
              className={`cursor-pointer transition-transform hover:scale-110 ${isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-900"}`}
            />
            {/* Ikon komen sekarang juga ngebuka list komentar */}
            <MessageCircle
              onClick={toggleComments}
              size={24}
              className="cursor-pointer stroke-gray-900 transition-transform hover:scale-110"
            />
            <Send
              size={24}
              className="cursor-pointer stroke-gray-900 transition-transform hover:scale-110"
            />
          </div>
          <Bookmark
            size={24}
            className="cursor-pointer stroke-gray-900 transition-transform hover:scale-110"
          />
        </div>

        <p className="mb-1 text-sm font-semibold text-gray-900">
          {likesCount} likes
        </p>

        {post.caption && (
          <p className="text-sm text-gray-900">
            {/* Username di caption juga bisa diklik */}
            <Link
              href={`/${post.user.username}`}
              className="mr-2 font-semibold transition-opacity hover:opacity-70"
            >
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Tombol Lihat Komentar */}
        {commentsCount > 0 && (
          <p
            onClick={toggleComments}
            className="mt-1 cursor-pointer text-sm text-gray-500 hover:underline"
          >
            {showComments
              ? "Hide comments"
              : `View all ${commentsCount} comments`}
          </p>
        )}

        {/* --- AREA DAFTAR KOMENTAR --- */}
        {showComments && (
          <div className="mt-2 flex max-h-40 flex-col gap-2 overflow-y-auto pt-2 border-t border-gray-100">
            {isLoadingComments ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin text-gray-400" size={20} />
              </div>
            ) : (
              commentsList.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <Link
                    href={`/${comment.user.username}`}
                    className="mr-2 font-semibold hover:opacity-70"
                  >
                    {comment.user.username}
                  </Link>
                  <span className="text-gray-800">{comment.content}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleComment}
        className="flex items-center border-t border-gray-200 px-3 pt-3"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 text-sm outline-none placeholder:text-gray-400"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!commentText.trim() || isSubmitting}
          className="text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}
