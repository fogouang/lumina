"use client";

import { Calendar, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { MonthlySessionResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";

interface SessionCardProps {
  session: MonthlySessionResponse;
  onEdit: (session: MonthlySessionResponse) => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionCard({
  session,
  onEdit,
  onDelete,
}: SessionCardProps) {
  const monthDisplay = new Date(session.month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">{session.name}</CardTitle>
            </div>
            <CardDescription>{monthDisplay}</CardDescription>
          </div>
          <Badge variant={session.is_active ? "default" : "secondary"}>
            {session.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Type</div>
          <div className="font-medium">EE + EO (complète)</div>
          
          <div className="text-muted-foreground">Créée le</div>
          <div>
            {new Date(session.created_at).toLocaleDateString("fr-FR")}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={ROUTES.ADMIN_SESSION_TASKS(session.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Tâches
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(session)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(session.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}