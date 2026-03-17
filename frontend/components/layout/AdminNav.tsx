"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  Home,
  Users,
  Building2,
  BookOpen,
  FileQuestion,
  CreditCard,
  FileText,
  BarChart3,
  LucideIcon,
  Settings,
  List,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Définir un type générique pour les items
interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const adminNavItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: ROUTES.ADMIN_DASHBOARD,
    icon: Home,
  },
  {
    title: "Utilisateurs",
    href: ROUTES.ADMIN_USERS,
    icon: Users,
  },
  {
    title: "Organisations",
    href: ROUTES.ADMIN_ORGANIZATIONS,
    icon: Building2,
  },
];

const contentNavItems: NavItem[] = [
  {
    title: "Séries",
    href: ROUTES.ADMIN_SERIES,
    icon: BookOpen,
  },
  {
    title: "Expression public",
    href: ROUTES.ADMIN_TASKS,
    icon: FileQuestion,
  },
];

const financeNavItems: NavItem[] = [
  {
    title: "Paiements",
    href: ROUTES.ADMIN_PAYMENTS,
    icon: CreditCard,
  },
  {
    title: "Factures",
    href: ROUTES.ADMIN_INVOICES,
    icon: FileText,
  },
  {
    title: "Abonnements",
    href: ROUTES.ADMIN_SUBSCRIPTIONS,
    icon: Users,
  },
  {
    title: "Plans",
    href: ROUTES.ADMIN_PLANS,
    icon: List,
  },
];

const analyticsNavItems: NavItem[] = [
  {
    title: "Analytics",
    href: ROUTES.ADMIN_ANALYTICS,
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: ROUTES.ADMIN_SETTINGS_ORAL_AUDIOS,
    icon: Settings,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  // ✅ Typer explicitement le paramètre
  const renderNavSection = (items: NavItem[], title?: string) => (
    <>
      {title && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {items.map((item) => {
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
    </>
  );

  return (
    <nav className="space-y-4 px-3">
      {/* Main */}
      <div className="space-y-1">{renderNavSection(adminNavItems)}</div>

      <Separator />

      {/* Content */}
      <div className="space-y-1">
        {renderNavSection(contentNavItems, "Contenu")}
      </div>

      <Separator />

      {/* Finance */}
      <div className="space-y-1">
        {renderNavSection(financeNavItems, "Finance")}
      </div>

      <Separator />

      {/* Analytics */}
      <div className="space-y-1">
        {renderNavSection(analyticsNavItems, "Statistiques")}
      </div>
    </nav>
  );
}
