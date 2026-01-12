"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";

import StudentNav from "./StudentNav";
import TeacherNav from "./TeacherNav";
import AdminNav from "./AdminNav";


interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();

  const renderNav = () => {
    switch (user?.role) {
      case USER_ROLES.STUDENT:
        return <StudentNav />;
      case USER_ROLES.TEACHER:
      case USER_ROLES.ORG_ADMIN:
        return <TeacherNav />;
      case USER_ROLES.PLATFORM_ADMIN:
        return <AdminNav />;
      default:
        return <StudentNav />;
    }
  };

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 border-r bg-background",
          className
        )}
      >
        <div className="flex-1 overflow-auto py-6">{renderNav()}</div>
      </aside>
    </>
  );
}
