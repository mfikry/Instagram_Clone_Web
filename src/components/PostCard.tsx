"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Loader2,
  Trash2,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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
  userId: string;
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

  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<CommentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter(); // Tambahin ini buat fungsi nendang user
  // STATE BARU: Buat ngontrol Pop-up modern kita muncul atau enggak
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  let currentUserId = null;
  const token = Cookies.get("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.sub;
    } catch (e) {
      console.error("Gagal membaca token", e);
    }
  }
  const isOwnPost = currentUserId === post.userId;

  const handleLike = async () => {
    // TAMBAHIN BLOK INI DI PALING ATAS
    if (!Cookies.get("token")) {
      toast.error("Login dulu bos buat nge-Like!");
      router.push("/login");
      return;
    }
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      await api.post(`/likes/${post.id}`);
    } catch (error) {
      console.error(error);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      toast.error("Gagal menyukai postingan");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // TAMBAHIN BLOK INI DI SINI
    if (!Cookies.get("token")) {
      toast.error("Login dulu bos buat komen!");
      router.push("/login");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/comments/${post.id}`, { content: commentText });
      setCommentText("");
      setCommentsCount((prev) => prev + 1);
      toast.success("Komentar berhasil ditambahkan!");

      if (showComments) {
        fetchComments();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await api.get(`/comments/${post.id}`);
      setCommentsList(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat komentar");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments && commentsList.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  // Logika Delete yang udah bersih dari window.confirm jelek
  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`);
      toast.success("Postingan berhasil dihapus");
      setShowDeleteModal(false); // Tutup pop-up
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus postingan");
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="mb-6 w-full max-w-117.5 rounded-lg border border-gray-200 bg-white pb-4 sm:mb-8">
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

          <div className="relative">
            <MoreHorizontal
              className="cursor-pointer text-gray-500 hover:text-gray-900"
              size={20}
              onClick={() => setShowMenu(!showMenu)}
            />

            {showMenu && (
              <div className="absolute right-0 top-6 z-10 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                {isOwnPost && (
                  <button
                    // Tombol ini sekarang cuma buka state Pop-up, bukan manggil API langsung
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-gray-50"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
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
              <Link
                href={`/${post.user.username}`}
                className="mr-2 font-semibold transition-opacity hover:opacity-70"
              >
                {post.user.username}
              </Link>
              {post.caption}
            </p>
          )}

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

      {/* --- POP-UP CUSTOM (MODAL DELETE MODERN) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-sm scale-100 animate-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Hapus Postingan?
            </h3>
            <p className="mb-8 text-sm text-gray-500">
              Yakin ingin menghapus postingan ini secara permanen? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 shadow-md shadow-red-500/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
