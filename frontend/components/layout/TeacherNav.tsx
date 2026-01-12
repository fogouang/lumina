"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  Home,
  Users,
  CheckSquare,
  Building2,
} from "lucide-react";

const teacherNavItems = [
  {
    title: "Tableau de bord",
    href: ROUTES.TEACHER_DASHBOARD,
    icon: Home,
  },
  {
    title: "Mes étudiants",
    href: ROUTES.TEACHER_STUDENTS,
    icon: Users,
  },
  {
    title: "Corrections en attente",
    href: ROUTES.TEACHER_CORRECTIONS_PENDING,
    icon: CheckSquare,
  },
  {
    title: "Corrections terminées",
    href: ROUTES.TEACHER_CORRECTIONS_COMPLETED,
    icon: CheckSquare,
  },
  {
    title: "Mon organisation",
    href: ROUTES.TEACHER_ORGANIZATION,
    icon: Building2,
  },
];

export default function TeacherNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3">
      {teacherNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

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