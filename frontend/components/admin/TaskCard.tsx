import {
  MoreVertical,
  Edit,
  Trash2,
  Volume2,
  Clock,
  FileText,
} from "lucide-react";
import { ExpressionTaskResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: ExpressionTaskResponse;
  onEdit: (task: ExpressionTaskResponse) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  // ✅ Déterminer le titre à afficher
  const displayTitle = task.title || task.instruction_text;
  const hasDocuments = task.document_1 || task.document_2;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              Tâche #{task.task_number}
              <Badge variant={task.type === "oral" ? "default" : "secondary"}>
                {task.type === "oral" ? "Oral" : "Écrit"}
              </Badge>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {displayTitle}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Media/Info indicators */}
        <div className="flex flex-wrap gap-2">
          {task.instruction_audio_url && (
            <Badge variant="outline" className="text-xs">
              <Volume2 className="mr-1 h-3 w-3" />
              Audio consigne
            </Badge>
          )}
          {task.type === "written" &&
            task.word_count_min &&
            task.word_count_max && (
              <Badge variant="outline" className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                {task.word_count_min}-{task.word_count_max} mots
              </Badge>
            )}
          {hasDocuments && (
            <Badge variant="outline" className="text-xs">
              <FileText className="mr-1 h-3 w-3" />2 documents
            </Badge>
          )}
          {task.type === "oral" && task.preparation_time_seconds !== null && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Prépa: {task.preparation_time_seconds}s
            </Badge>
          )}
          {task.type === "oral" && task.recording_time_seconds !== null && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Enreg: {task.recording_time_seconds}s
            </Badge>
          )}
        </div>

        {/* Content Preview */}
        {task.title ? (
          // ✅ Tâche 3 écrite avec titre + documents
          <div className="space-y-2">
            <div className="text-sm bg-muted p-3 rounded">
              <p className="font-medium mb-1">Titre:</p>
              <p className="text-muted-foreground">{task.title}</p>
            </div>
            {task.document_1 && (
              <div className="text-sm bg-muted p-3 rounded">
                <p className="font-medium mb-1">Document 1:</p>
                <p className="text-muted-foreground line-clamp-2">
                  {task.document_1}
                </p>
              </div>
            )}
            {task.document_2 && (
              <div className="text-sm bg-muted p-3 rounded">
                <p className="font-medium mb-1">Document 2:</p>
                <p className="text-muted-foreground line-clamp-2">
                  {task.document_2}
                </p>
              </div>
            )}
          </div>
        ) : (
          // ✅ Tâches 1/2 écrites ou oral
          <div className="text-sm bg-muted p-3 rounded">
            <p className="font-medium mb-1">Consigne:</p>
            <p className="text-muted-foreground line-clamp-3">
              {task.instruction_text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
