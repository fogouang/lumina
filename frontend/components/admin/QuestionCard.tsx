import { MoreVertical, Edit, Trash2, Volume2, Image as ImageIcon } from "lucide-react";
import { QuestionResponse } from "@/lib/api";
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

interface QuestionCardProps {
  question: QuestionResponse;
  onEdit: (question: QuestionResponse) => void;
  onDelete: (questionId: string) => void;
}

export default function QuestionCard({
  question,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const getCorrectAnswerText = () => {
    switch (question.correct_answer) {
      case "a":
        return question.option_a;
      case "b":
        return question.option_b;
      case "c":
        return question.option_c;
      case "d":
        return question.option_d;
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              Question #{question.question_number}
              <Badge variant={question.type === "oral" ? "default" : "secondary"}>
                {question.type === "oral" ? "Oral" : "Écrit"}
              </Badge>
              <Badge variant="outline">{question.points} pts</Badge>
            </CardTitle>
            {question.question_text && (
              <CardDescription className="line-clamp-2">
                {question.question_text}
              </CardDescription>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(question)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(question.id)}
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
        {/* Media indicators */}
        <div className="flex gap-2">
          {question.audio_url && (
            <Badge variant="outline" className="text-xs">
              <Volume2 className="mr-1 h-3 w-3" />
              Audio
            </Badge>
          )}
          {question.image_url && (
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="mr-1 h-3 w-3" />
              Image
            </Badge>
          )}
        </div>

        {/* Options */}
        <div className="space-y-1 text-sm">
          <div
            className={`p-2 rounded ${
              question.correct_answer === "a" ? "bg-green-50 border border-green-200" : "bg-muted"
            }`}
          >
            <span className="font-medium">A.</span> {question.option_a}
          </div>
          <div
            className={`p-2 rounded ${
              question.correct_answer === "b" ? "bg-green-50 border border-green-200" : "bg-muted"
            }`}
          >
            <span className="font-medium">B.</span> {question.option_b}
          </div>
          <div
            className={`p-2 rounded ${
              question.correct_answer === "c" ? "bg-green-50 border border-green-200" : "bg-muted"
            }`}
          >
            <span className="font-medium">C.</span> {question.option_c}
          </div>
          <div
            className={`p-2 rounded ${
              question.correct_answer === "d" ? "bg-green-50 border border-green-200" : "bg-muted"
            }`}
          >
            <span className="font-medium">D.</span> {question.option_d}
          </div>
        </div>

        {/* Correct Answer */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Réponse correcte:</span>{" "}
          {question.correct_answer.toUpperCase()} - {getCorrectAnswerText()}
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
            <span className="font-medium">Explication:</span> {question.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}