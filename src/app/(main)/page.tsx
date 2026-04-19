"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import PostCard, { PostType } from "@/components/PostCard"; // <-- Import PostType-nya

import PostSkeleton from "@/components/PostSkeleton";

export default function Home() {
  // Ganti any[] jadi PostType[]
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await api.get("/feed");
        setPosts(response.data.data);
      } catch (err: unknown) {
        // Ganti any jadi unknown biar aman
        setError("Gagal memuat feed. Pastikan kamu sudah login.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  // Jangan lupa import PostSkeleton di bagian atas:
  // import PostSkeleton from '@/components/PostSkeleton';

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center px-4 py-8">
        {/* Kita render 2 skeleton biar layarnya penuh */}
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="mt-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex w-full flex-col items-center px-4 py-8">
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="mt-20 text-center text-gray-500">
          <p className="text-xl font-bold">Timeline Kosong 🥲</p>
          <p className="mt-2 text-sm">
            Coba follow seseorang atau buat postingan baru.
          </p>
        </div>
      )}
    </div>
  );
}
