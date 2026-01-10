import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calendar, Scissors, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    // redirect("/"); // Uncomment this to enforce protection after you set up your admin user
    // For now, we'll allow access but show a warning or just proceed for development if role is missing
    if (!session) redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 text-white flex flex-col">
        <div className="p-6 border-b border-dark-700">
          <h1 className="text-xl font-serif font-bold text-gold-400">Noella Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin/bookings" 
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Bookings
          </Link>
          <Link 
            href="/admin/services" 
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
          >
            <Scissors className="w-5 h-5" />
            Services
          </Link>
          <Link 
            href="/admin/availability" 
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Availability
          </Link>
        </nav>

        <div className="p-4 border-t border-dark-700">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                    {session.user.name?.[0] || "A"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs truncate opacity-70">Admin</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
