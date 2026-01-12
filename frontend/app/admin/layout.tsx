import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/providers/Protectedroute";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-dvh flex flex-col bg-background">
        {/* Header fixe */}
        <header className="sticky top-0 z-50 h-16 border-b bg-background">
          <Header />
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar fixe et scrollable */}
          <aside className="hidden lg:flex lg:w-64 border-r bg-background">
            <Sidebar />
          </aside>

          {/* Main content scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
