"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  Home,
  BookOpen,
  FileText,
  CheckSquare,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";

const studentNavItems = [
  {
    title: "Tableau de bord",
    href: ROUTES.STUDENT_DASHBOARD,
    icon: Home,
  },
  {
    title: "Séries d'examens",
    href: ROUTES.STUDENT_SERIES,
    icon: BookOpen,
  },
  {
    title: "Mes résultats",
    href: ROUTES.STUDENT_RESULTS,
    icon: FileText,
  },
  {
    title: "Mes corrections",
    href: ROUTES.STUDENT_CORRECTIONS_LIST,
    icon: CheckSquare,
  },
  {
    title: "Abonnement",
    href: ROUTES.STUDENT_SUBSCRIPTION,
    icon: CreditCard,
  },
  {
    title: "Notifications",
    href: ROUTES.STUDENT_NOTIFICATIONS,
    icon: Bell,
  },
  {
    title: "Paramètres",
    href: ROUTES.STUDENT_SETTINGS,
    icon: Settings,
  },
];

export default function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3">
      {studentNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
