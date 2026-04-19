"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Ambil data user yang lagi login
        const res = await api.get("/users/me");
        const myUsername = res.data.data.username;

        // Langsung lempar ke halaman /[username]
        router.replace(`/${myUsername}`);
      } catch (error) {
        console.error("Gagal ambil data user", error);
        router.replace("/login"); // Kalau gagal/token mati, tendang ke login
      }
    };

    fetchMe();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="animate-spin text-gray-500" size={32} />
    </div>
  );
}
