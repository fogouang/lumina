"use client";

import { useState } from "react";
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import {
  useNotifications,
  useNotificationStats,
} from "@/hooks/queries/useNotificationsQueries";
import {
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/mutations/useNotificationsMutations";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DateDisplay from "@/components/shared/DateDisplay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NotificationType = "success" | "warning" | "info";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications, isLoading } = useNotifications(
    0,
    50,
    filter === "unread"
  );
  const { data: stats } = useNotificationStats();

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle className="h-5 w-5 text-green-600" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      info: <Info className="h-5 w-5 text-blue-600" />,
    };
    return icons[type] || icons.info;
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des notifications..." />
    );
  }

  const notificationsList = notifications || [];
  const unreadCount = stats?.unread || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Restez informé de vos corrections et mises à jour"
      />

      {/* Stats & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as "all" | "unread")}
          >
            <SelectTrigger className="w-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues ({unreadCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notificationsList.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description={
            filter === "unread"
              ? "Vous avez lu toutes vos notifications"
              : "Vous n'avez pas encore de notifications"
          }
        />
      ) : (
        <div className="space-y-3">
          {notificationsList.map((notification: any) => (
            <Card
              key={notification.id}
              className={notification.is_read ? "opacity-60" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Badge variant="default" className="ml-2">
                          Nouveau
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <DateDisplay
                        date={notification.created_at}
                        className="text-xs text-muted-foreground"
                      />

                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              markAsRead({
                                notification_ids: [notification.id],
                              })
                            }
                          >
                            Marquer comme lu
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          title="Suppression non disponible"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
