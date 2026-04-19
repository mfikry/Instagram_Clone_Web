"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, Grid, Lock, UserPlus, UserMinus, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast/headless";

// "KTP" Data Profil biar TypeScript nggak ngamuk
interface ProfileData {
  profile: {
    id: string;
    username: string;
    fullName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    _count: { posts: number; followers: number; following: number };
  };
  relationship: {
    isOwnProfile: boolean;
    isFollowing: boolean;
    followStatus: string | null;
  };
  isPrivate: boolean;
  posts: {
    id: string;
    media: { url: string }[];
    _count: { likes: number; comments: number };
  }[];
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${username}`);
        setData(response.data.data);
      } catch (err: unknown) {
        setError("User tidak ditemukan atau terjadi kesalahan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  // Fungsi Action Tombol Follow/Unfollow
  const handleFollowToggle = async () => {
    // Cek apakah dia tamu?
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Login dulu bos buat follow!");
      router.push("/login"); // Tendang ke halaman login
      return;
    }
    if (!data) return;
    setIsFollowLoading(true);
    try {
      const response = await api.post(`/follows/${data.profile.id}`);

      // Update UI langsung tanpa harus refresh halaman
      setData({
        ...data,
        relationship: {
          ...data.relationship,
          isFollowing: response.data.isFollowing,
          followStatus: response.data.status,
        },
        profile: {
          ...data.profile,
          _count: {
            ...data.profile._count,
            // Tambah 1 kalau follow diterima, kurang 1 kalau unfollow
            followers:
              response.data.isFollowing && response.data.status === "ACCEPTED"
                ? data.profile._count.followers + 1
                : !response.data.isFollowing &&
                    data.relationship.followStatus === "ACCEPTED"
                  ? data.profile._count.followers - 1
                  : data.profile._count.followers,
          },
        },
      });
    } catch (err) {
      console.error("Gagal follow/unfollow", err);
      alert("Gagal memproses permintaan.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-20 text-center text-xl font-semibold text-gray-600">
        {error}
      </div>
    );
  }

  const { profile, relationship, isPrivate, posts } = data;

  return (
    <div className="w-full max-w-4xl px-4 py-8 md:px-8">
      {/* --- HEADER PROFIL --- */}
      <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-16">
        {/* Foto Profil */}
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-gray-200 md:h-40 md:w-40">
          {profile.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-yellow-400 to-fuchsia-600 text-5xl font-bold text-white">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info & Stats */}
        <div className="flex flex-1 flex-col items-center md:items-start">
          <div className="mb-4 flex flex-col items-center gap-4 md:flex-row">
            <h1 className="text-2xl font-semibold text-gray-900">
              {profile.username}
            </h1>

            {/* Tombol Action (Edit Profile / Follow / Unfollow) */}
            {relationship.isOwnProfile ? (
              <Link
                href="/settings"
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`flex items-center gap-2 rounded-lg px-6 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  relationship.isFollowing
                    ? "bg-gray-100 text-gray-900 hover:bg-red-50" // Tombol Unfollow
                    : relationship.followStatus === "PENDING"
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200" // Tombol Requested
                      : "bg-blue-500 text-white hover:bg-blue-600" // Tombol Follow
                }`}
              >
                {relationship.isFollowing ? (
                  <>
                    Unfollow <UserMinus size={16} />
                  </>
                ) : relationship.followStatus === "PENDING" ? (
                  <>
                    Requested <Clock size={16} />
                  </>
                ) : (
                  <>
                    Follow <UserPlus size={16} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Statistik */}
          <div className="mb-4 flex gap-8 text-base">
            <span>
              <span className="font-semibold text-gray-900">
                {profile._count.posts}
              </span>{" "}
              posts
            </span>
            <span>
              <span className="font-semibold text-gray-900">
                {profile._count.followers}
              </span>{" "}
              followers
            </span>
            <span>
              <span className="font-semibold text-gray-900">
                {profile._count.following}
              </span>{" "}
              following
            </span>
          </div>

          {/* Bio */}
          <div className="text-sm">
            <p className="font-semibold text-gray-900">
              {profile.fullName || profile.username}
            </p>
            <p className="whitespace-pre-wrap text-gray-700">
              {profile.bio || "Belum ada bio."}
            </p>
          </div>
        </div>
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <div className="mb-4 flex justify-center border-t border-gray-200">
        <div className="flex items-center gap-2 border-t-2 border-gray-900 px-4 pt-4 text-xs font-semibold tracking-widest text-gray-900">
          <Grid size={14} /> POSTS
        </div>
      </div>

      {/* --- KONTEN (GRID / PRIVATE MESSAGE) --- */}
      {isPrivate ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center text-gray-500">
          <div className="mb-4 rounded-full border-2 border-gray-900 p-4">
            <Lock size={48} className="text-gray-900" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            This Account is Private
          </h2>
          <p className="text-sm">Follow to see their photos and videos.</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            // Kita ubah div jadi Link, dan tambahin href ngarah ke /p/[post.id]
            <Link
              key={post.id}
              href={`/p/${post.id}`}
              className="group relative block aspect-square w-full cursor-pointer overflow-hidden bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media[0].url}
                alt="Post"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />

              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="font-bold text-white">
                  ❤️ {post._count.likes}
                </span>
                <span className="font-bold text-white">
                  💬 {post._count.comments}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-gray-500">
          <h2 className="text-2xl font-bold text-gray-900">No Posts Yet</h2>
        </div>
      )}
    </div>
  );
}
