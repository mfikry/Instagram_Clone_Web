"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import PostCard, { PostType } from "@/components/PostCard";
import { Loader2 } from "lucide-react";

export default function SinglePostPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data.data);
      } catch (err) {
        setError("Postingan tidak ditemukan atau sudah dihapus.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mt-20 text-center text-xl font-semibold text-gray-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center px-4 py-8">
      {/* Tuh kan! Komponen PostCard lu bisa dipake ulang di sini! */}
      <PostCard post={post} />
    </div>
  );
}
