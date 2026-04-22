"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Loader2, Camera } from "lucide-react"; // Tambahin icon Camera
import Image from "next/image";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  // State baru untuk Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/default-avatar.png"); // Ganti default path kalau perlu

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/users/me");
        setFullName(res.data.data.fullName || "");
        setBio(res.data.data.bio || "");
        // Ambil foto profil lama dari database kalau ada
        if (res.data.data.avatarUrl) {
          setPreviewUrl(res.data.data.avatarUrl);
        }
      } catch {
        console.error("Gagal load profil");
      }
    };
    fetchMe();
  }, []);

  // Fungsi saat pilih foto
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setAvatarFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      // WAJIB pakai FormData karena kita mau ngirim File
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("bio", bio);

      if (avatarFile) {
        formData.append("avatar", avatarFile); // Nama "avatar" ini harus sama kayak di backend upload.single('avatar')
      }

      await api.patch("/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profil diperbarui! 🎉", { id: toastId });
    } catch {
      toast.error("Gagal memperbarui profil", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-gray-200"
      >
        {/* --- BAGIAN FOTO PROFIL --- */}
        <div className="flex flex-col items-center mb-4">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image
              src={previewUrl}
              alt="Avatar"
              fill
              sizes="96px"
              className="object-cover"
            />
            {/* Overlay gelap pas di-hover */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-8 h-8" />
            </div>
          </div>
          <p
            className="text-sm text-blue-500 mt-2 cursor-pointer font-semibold hover:text-blue-700"
            onClick={() => fileInputRef.current?.click()}
          >
            Ganti Foto
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarSelect}
          />
        </div>
        {/* --------------------------- */}

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Full Name
          </label>
          <input
            className="w-full mt-1 p-2 border rounded-lg outline-none focus:border-blue-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Bio</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-lg h-24 resize-none outline-none focus:border-blue-500"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 mt-2"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
