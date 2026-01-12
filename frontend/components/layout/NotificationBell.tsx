"use client";

import { Bell } from "lucide-react";
import { useNotifications, useNotificationStats } from "@/hooks/queries/useNotificationsQueries";
import { useMarkAsRead } from "@/hooks/mutations/useNotificationsMutations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotificationBell() {
  const { data: notifications } = useNotifications(0, 5, true); 
  const { data: stats } = useNotificationStats();
  const { mutate: markAsRead } = useMarkAsRead();

  const notificationsList = notifications || [];
  const unreadCount = stats?.unread || 0; 

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      // passer un tableau d'IDs comme attendu par l'API
      markAsRead({ notification_ids: [notificationId] });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-75">
          {notificationsList.length > 0 ? (
            notificationsList.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification.id, notification.is_read)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                {/* ✅ Pas de message dans NotificationListResponse, on l'enlève */}
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={ROUTES.STUDENT_NOTIFICATIONS} className="w-full text-center">
            Voir toutes les notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}