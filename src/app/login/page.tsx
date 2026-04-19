"use client"; // Wajib ada karena kita pakai useState dan useRouter

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Nembak API Supabase buat Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // Simpan Token di Cookies selama 1 hari
      Cookies.set("token", data.session.access_token, { expires: 1 });

      // Lempar user ke halaman utama (Home)
      router.push("/");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-md border border-gray-300 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-3xl font-bold italic text-gray-900">
          Instagram Clone
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="rounded border border-gray-300 bg-gray-50 p-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded border border-gray-300 bg-gray-50 p-2 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
          <p>Belum punya akun?</p>
          <span className="cursor-pointer font-semibold text-blue-500 hover:text-blue-700">
            Daftar
          </span>
        </div>
      </div>
    </div>
  );
}
