"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      const res = await api.get("/users/me");
      setFullName(res.data.data.fullName || "");
      setBio(res.data.data.bio || "");
    };
    fetchMe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/users/me", { fullName, bio });
      toast.success("Profil diperbarui!");
    } catch {
      toast.error("Gagal memperbarui profil");
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
          className="bg-blue-500 text-white p-2 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50"
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
