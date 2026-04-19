"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Home, Search, PlusSquare, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token"); // Hapus token dari brankas
    router.push("/login"); // Tendang balik ke halaman login
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Create", href: "/create", icon: PlusSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    // Lebar sidebar: 64px di HP, 256px di Desktop
    <div className="flex h-screen w-16 flex-col justify-between border-r border-gray-300 bg-white py-6 md:w-64 md:px-6 sticky top-0">
      {/* Logo */}
      <div className="mb-8 hidden md:block">
        <h1 className="text-2xl font-bold italic text-gray-900">Instagram</h1>
      </div>
      <div className="mb-8 flex justify-center md:hidden">
        <span className="text-xl font-bold italic text-gray-900">IG</span>
      </div>

      {/* Navigasi Menu */}
      <nav className="flex flex-1 flex-col gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-gray-100 ${
                isActive ? "font-bold" : ""
              }`}
            >
              <Icon
                className={isActive ? "stroke-[2.5px]" : "stroke-1"}
                size={26}
              />
              <span className="hidden text-base md:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tombol Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 rounded-lg p-3 text-red-500 transition-all hover:bg-gray-100"
      >
        <LogOut size={26} />
        <span className="hidden text-base md:block">Logout</span>
      </button>
    </div>
  );
}
