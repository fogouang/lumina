// app/(platform)/layout.tsx
import Footer from "@/components/loading/footer";
import { Navbar } from "@/components/loading/navbar";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster />
    </QueryProvider>
  );
}
