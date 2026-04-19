"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Search as SearchIcon, Loader2 } from "lucide-react";

// 1. Kita buatin KTP-nya di sini sesuai data dari Backend!
export interface SearchResult {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");

  // 2. Ganti any[] jadi SearchResult[]
  const [results, setResults] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/users/search?q=${query}`);
        setResults(res.data.data);
      } catch (error: unknown) {
        // Biasakan pakai unknown daripada any
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search Users</h1>

      <div className="relative mb-8 shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <SearchIcon className="text-gray-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Search by username..."
          className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pl-12 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : query && results.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No users found.</p>
        ) : (
          results.map((user) => (
            <Link
              key={user.id}
              href={`/${user.username}`}
              className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-gray-100"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {user.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-yellow-400 to-fuchsia-600 text-lg font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  {user.username}
                </span>
                {user.fullName && (
                  <span className="text-sm text-gray-500">{user.fullName}</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
