import { Clock, User, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DateDisplay from "@/components/shared/DateDisplay";

interface PendingCorrectionCardProps {
  correction: {
    id: string;
    student_name: string;
    task_type: string;
    submitted_at: string;
    word_count?: number;
  };
  onCorrect: (correctionId: string) => void;
}

export default function PendingCorrectionCard({ 
  correction, 
  onCorrect 
}: PendingCorrectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {correction.student_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{correction.task_type}</p>
          </div>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Soumis le</span>
          <DateDisplay date={correction.submitted_at} />
        </div>

        {correction.word_count && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nombre de mots</span>
            <Badge variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              {correction.word_count} mots
            </Badge>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={() => onCorrect(correction.id)}
        >
          Corriger
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}