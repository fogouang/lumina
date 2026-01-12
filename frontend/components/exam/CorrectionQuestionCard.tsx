import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "./AudioPlayer";
import { QuestionResponse, QuestionType } from "@/lib/api";
import { getMediaUrl } from "@/lib/media-path";

interface CorrectionQuestionCardProps {
  question: QuestionResponse;
  userAnswer?: {
    selected_answer: string;
    is_correct: boolean;
    points_earned: number;
  };
}

export default function CorrectionQuestionCard({
  question,
  userAnswer,
}: CorrectionQuestionCardProps) {
  const correctAnswer = question.correct_answer;
  const selectedAnswer = userAnswer?.selected_answer.toUpperCase();
  const isCorrect = userAnswer?.is_correct || false;

  const getOptionClass = (option: string) => {
    const isSelected = option === selectedAnswer;
    const isCorrectOption = option === correctAnswer.toUpperCase();

    if (isSelected && isCorrect) {
      return "border-green-500 bg-green-50 dark:bg-green-950";
    }
    if (isSelected && !isCorrect) {
      return "border-red-500 bg-red-50 dark:bg-red-950";
    }
    if (isCorrectOption) {
      return "border-green-500 bg-green-50 dark:bg-green-950";
    }
    return "border-muted";
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm lg:text-lg">
            Question {question.question_number}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                question.type === QuestionType.ORAL ? "default" : "secondary"
              }
              className=""
            >
              {question.type === QuestionType.ORAL
                ? "Compréhension Orale"
                : "Compréhension Écrite"}
            </Badge>
            {userAnswer && (
              <Badge variant={isCorrect ? "default" : "destructive"}>
                {isCorrect ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Correct (+{userAnswer.points_earned} pts)
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Incorrect
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio */}
        {question.audio_url && (
          <AudioPlayer src={getMediaUrl(question.audio_url) ?? ""} />
        )}

        {/* Image */}
        {question.image_url && (
          <img
            src={getMediaUrl(question.image_url) ?? ""}
            alt="Question"
            className="w-full rounded-lg border"
          />
        )}

        {/* Question */}
        {question.question_text && (
          <div className="prose prose-sm">
            <p className="font-medium">{question.question_text}</p>
          </div>
        )}

        {/* Options avec correction */}
        <div className="space-y-3">
          {["A", "B", "C", "D"].map((option) => {
            const optionText =
              option === "A"
                ? question.option_a
                : option === "B"
                ? question.option_b
                : option === "C"
                ? question.option_c
                : question.option_d;

            const isSelected = option === selectedAnswer;
            const isCorrectOption = option === correctAnswer.toUpperCase();

            return (
              <div
                key={option}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 ${getOptionClass(
                  option
                )}`}
              >
                <div className="flex items-center gap-2">
                  {isSelected && isCorrect && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                  {isSelected && !isCorrect && (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  {!isSelected && isCorrectOption && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-bold mr-2">{option}.</span>
                  {optionText}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explication */}
        {question.explanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">💡 Explication :</p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
