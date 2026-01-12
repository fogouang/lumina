"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";

import StudentNav from "./StudentNav";
import TeacherNav from "./TeacherNav";
import AdminNav from "./AdminNav";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left text-lg font-semibold">
            Menu
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-auto py-6 px-2">
          <div onClick={() => setOpen(false)}>{renderNav()}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
