import Sidebar from "@/components/Sidebar";

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
    </div>
  );
}
