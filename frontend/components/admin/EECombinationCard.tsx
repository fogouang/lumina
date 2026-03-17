"use client";

import { Edit, Trash2, FileText } from "lucide-react";
import { EECombinationResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EECombinationCardProps {
  combination: EECombinationResponse;
  onEdit: (combination: EECombinationResponse) => void;
  onDelete: (combinationId: string) => void;
}

export default function EECombinationCard({
  combination,
  onEdit,
  onDelete,
}: EECombinationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">#{combination.order}</Badge>
              <CardTitle className="text-lg">{combination.title}</CardTitle>
            </div>
            <CardDescription>
              Combinaison avec 3 tâches d'expression écrite
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tâche 1 */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Tâche 1</p>
            <Badge variant="outline" className="text-xs">
              {combination.task1_word_min}-{combination.task1_word_max} mots
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {combination.task1_instruction}
          </p>
        </div>

        {/* Tâche 2 */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Tâche 2</p>
            <Badge variant="outline" className="text-xs">
              {combination.task2_word_min}-{combination.task2_word_max} mots
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {combination.task2_instruction}
          </p>
        </div>

        {/* Tâche 3 */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Tâche 3</p>
            <Badge variant="outline" className="text-xs">
              {combination.task3_word_min}-{combination.task3_word_max} mots
            </Badge>
          </div>
          <p className="text-sm font-medium mb-1">{combination.task3_title}</p>
          <p className="text-xs text-muted-foreground">
            2 documents • Partie argumentative
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(combination)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(combination.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Metadata */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Créé le{" "}
          {new Date(combination.created_at).toLocaleDateString("fr-FR")}
        </div>
      </CardContent>
    </Card>
  );
}