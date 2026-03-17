"use client";

import { Edit, Trash2, Users } from "lucide-react";
import { EOTask3Response } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EOTask3CardProps {
  task: EOTask3Response;
  onEdit: (task: EOTask3Response) => void;
  onDelete: (taskId: string) => void;
}

export default function EOTask3Card({
  task,
  onEdit,
  onDelete,
}: EOTask3CardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <Badge variant="secondary">#{task.order}</Badge>
          </div>
        </div>
        <CardTitle className="text-base mt-2">Exercice en interaction</CardTitle>
        <CardDescription className="text-xs">4-5 minutes</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sujet */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <p className="text-sm leading-relaxed">{task.subject}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Metadata */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Créé le {new Date(task.created_at).toLocaleDateString("fr-FR")}
        </div>
      </CardContent>
    </Card>
  );
}