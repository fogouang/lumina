import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DateDisplay from "@/components/shared/DateDisplay";
import { ExamAttemptResponse } from "@/lib/api/models/ExamAttemptResponse";

interface AttemptCardProps {
  attempt: ExamAttemptResponse & {
    oral_level?: string | null;
    written_level?: string | null;
  };
  onViewResults?: (attemptId: string) => void;
  onContinue?: (attemptId: string) => void;
}

export default function AttemptCard({
  attempt,
  onViewResults,
  onContinue,
}: AttemptCardProps) {
  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: {
        label: "En cours",
        variant: "secondary" as const,
        icon: Loader2,
      },
      completed: {
        label: "Terminé",
        variant: "default" as const,
        icon: CheckCircle,
      },
      abandoned: {
        label: "Abandonné",
        variant: "destructive" as const,
        icon: XCircle,
      },
    };
    const {
      label,
      variant,
      icon: Icon,
    } = config[status as keyof typeof config];

    return (
      <Badge variant={variant}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const oralScore = attempt.oral_score || 0;
  const writtenScore = attempt.written_score || 0;
  const oralLevel = attempt.oral_level || "N/A";
  const writtenLevel = attempt.written_level || "N/A";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              Série n°{attempt.series_number}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <DateDisplay date={attempt.started_at} />
            </div>
          </div>
          {getStatusBadge(attempt.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Actions */}
        <div className="flex gap-2">
          {attempt.status === "in_progress" && onContinue && (
            <Button className="flex-1" onClick={() => onContinue(attempt.id)}>
              <Clock className="mr-2 h-4 w-4" />
              Continuer
            </Button>
          )}

          {attempt.status === "completed" && onViewResults && (
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => onViewResults(attempt.id)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Voir les résultats
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
