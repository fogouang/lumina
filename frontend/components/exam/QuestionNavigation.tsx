"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onQuestionSelect: (questionNumber: number) => void;
}

export default function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onQuestionSelect,
}: QuestionNavigationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Navigation</h3>
        <Badge variant="outline">
          {answeredQuestions.size} / {totalQuestions}
        </Badge>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
          const isAnswered = answeredQuestions.has(num);
          const isCurrent = num === currentQuestion;

          return (
            <Button
              key={num}
              variant={isCurrent ? "default" : isAnswered ? "answered" : "outline"}
              size="sm"
              onClick={() => onQuestionSelect(num)}
              className={cn(
                "h-10",
                isCurrent && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {num}
            </Button>
          );
        })}
      </div>

      <div className="flex gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-primary" />
          <span>Actuelle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span>Répondue</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded border" />
          <span>Non répondue</span>
        </div>
      </div>
    </div>
  );
}