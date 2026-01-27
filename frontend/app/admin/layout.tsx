import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/providers/Protectedroute";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-background">
        {/* Header fixe - 4rem de hauteur */}
        <header className="sticky top-0 z-50 h-16 border-b bg-background shrink-0">
          <Header />
        </header>

        {/* Container avec hauteur fixe = 100vh - header */}
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* Sidebar fixe, non scrollable */}
          <aside className="hidden lg:block lg:w-64 border-r bg-background shrink-0">
            <div className="h-full overflow-y-auto">
              <Sidebar />
            </div>
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
