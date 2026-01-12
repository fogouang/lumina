import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/providers/Protectedroute";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-dvh flex flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 h-16 border-b bg-background">
          <Header />
        </header>
        
        <div className="flex flex-1 relative">
          {/* Sidebar (desktop only) - Fixed */}
          <aside className="hidden lg:block lg:w-64 border-r bg-background fixed top-16 bottom-0 left-0 overflow-y-auto">
            <Sidebar />
          </aside>
          
          {/* Main Content - with left margin to account for fixed sidebar */}
          <main className="flex-1 overflow-y-auto lg:ml-64">
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}