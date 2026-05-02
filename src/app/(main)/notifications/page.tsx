"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, Heart, MessageCircle, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Notification {
  id: string;
  type: "LIKE_POST" | "COMMENT" | "FOLLOW";
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  entityId: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.data);
      } catch (error) {
        console.error("Gagal memuat notifikasi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleCardClick = (notif: Notification) => {
    if (notif.type === "LIKE_POST" || notif.type === "COMMENT") {
      if (notif.entityId) {
        // Arahin ke halaman detail postingan
        router.push(`/p/${notif.entityId}`);
      }
    } else if (notif.type === "FOLLOW") {
      // ✨ FIX: Sekarang arahin langsung ke /[username]
      router.push(`/${notif.actor.username}`);
    }
  };

  // ✨ FIX: Ubah parameter yang diterima jadi username, bukan userId
  const handleProfileClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    // ✨ FIX: Arahin langsung ke /[username]
    router.push(`/${username}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full mt-20">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Notifikasi</h1>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada notifikasi nih.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleCardClick(notif)}
              className={`flex items-center p-3 rounded-lg transition hover:bg-gray-100 cursor-pointer ${notif.isRead ? "bg-white" : "bg-blue-50/50"}`}
            >
              {/* 1. Foto Profil (Klik nama -> handleProfileClick bawa username) */}
              <div
                onClick={(e) => handleProfileClick(e, notif.actor.username)}
                className="shrink-0 relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 mr-4"
              >
                <Image
                  src={
                    notif.actor.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${notif.actor.username}&background=random`
                  }
                  alt={notif.actor.username}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              {/* 2. Isi Notifikasi */}
              <div className="flex-1">
                <p className="text-sm">
                  {/* Klik nama -> handleProfileClick bawa username */}
                  <span
                    onClick={(e) => handleProfileClick(e, notif.actor.username)}
                    className="font-bold hover:underline cursor-pointer"
                  >
                    {notif.actor.username}
                  </span>{" "}
                  {notif.type === "LIKE_POST" && "menyukai postingan Anda."}
                  {notif.type === "COMMENT" && "mengomentari postingan Anda."}
                  {notif.type === "FOLLOW" && "mulai mengikuti Anda."}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>

              {/* 3. Ikon di Kanan */}
              <div className="shrink-0 ml-4">
                {notif.type === "FOLLOW" ? (
                  <UserPlus className="w-5 h-5 text-blue-500" />
                ) : notif.type === "LIKE_POST" ? (
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
