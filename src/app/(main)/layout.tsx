import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast"; // <-- 1. Import ini

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex w-full flex-1 justify-center overflow-y-auto">
        {children}
      </main>

      {/* 2. Pasang di sini biar stand-by di pojok kanan bawah */}
      <Toaster position="bottom-right" />
    </div>
  );
}
