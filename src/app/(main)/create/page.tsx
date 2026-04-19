"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();

  // State untuk nyimpen file, preview gambar, caption, dan status loading
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Referensi ke input file yang disembunyikan (biar UI-nya bisa dikustom)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi saat user milih gambar dari komputernya
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Bikin URL sementara biar gambarnya bisa dimunculin di layar (Preview)
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  // Fungsi buat ngehapus gambar kalau salah pilih
  const handleClearImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Fungsi buat ngirim data ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Pilih gambar dulu bos!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Karena kita ngirim File, kita HARUS pakai FormData (bukan JSON biasa)
      const formData = new FormData();
      // 'media' dan 'caption' ini harus sesuai sama yang diharapkan backend lu
      formData.append("media", file);
      formData.append("caption", caption);

      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Postingan berhasil diupload! 🚀");
      router.push("/"); // Tendang balik ke Timeline
    } catch (err: unknown) {
      console.error("Gagal upload:", err);
      setError("Gagal mengupload postingan. Cek console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full max-w-3xl flex-col items-center px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Create New Post</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row"
      >
        {/* BAGIAN KIRI: Upload & Preview Gambar */}
        <div className="relative flex aspect-square w-full items-center justify-center border-b border-gray-200 bg-gray-50 md:w-1/2 md:border-b-0 md:border-r">
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center p-8 text-center">
              <ImageIcon
                size={64}
                className="mb-4 text-gray-400"
                strokeWidth={1.5}
              />
              <p className="mb-4 text-lg font-semibold text-gray-900">
                Drag photos and videos here
              </p>

              {/* Input file asli kita sembunyikan */}
              <input
                type="file"
                accept="image/*" // Cuma nerima gambar
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              {/* Tombol palsu yang pas diklik bakal nge-trigger input file di atas */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Select from computer
              </button>
            </div>
          )}
        </div>

        {/* BAGIAN KANAN: Caption & Submit */}
        <div className="flex w-full flex-col p-4 md:w-1/2">
          {error && (
            <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <textarea
            className="w-full flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="Write a caption..."
            rows={8}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={!file || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Sharing...
                </>
              ) : (
                "Share"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
