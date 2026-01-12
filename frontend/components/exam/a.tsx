"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "./AudioPlayer";
import { QuestionResponse, QuestionType } from "@/lib/api";
import { getMediaUrl } from "@/lib/media-path";

interface QuestionCardProps {
  question: QuestionResponse;
  selectedAnswer?: string;
  onAnswerChange: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled = false,
}: QuestionCardProps) {
  return (
    <Card className="mx-auto w-full max-w-6xl">
      {" "}
      {/* Largeur max augmentée car on passe en 2 colonnes */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            Question {question.question_number}
          </CardTitle>
          <Badge
            variant={
              question.type === QuestionType.ORAL ? "default" : "secondary"
            }
          >
            {question.type === QuestionType.ORAL ? "Orale" : "Écrite"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Conteneur Grid : 1 col sur mobile, 2 cols sur LG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLONNE GAUCHE : Contenu (Audio, Image, Texte) */}
          <div className="space-y-4">
            {question.audio_url && (
              <div className="bg-muted/30 p-2 rounded-lg">
                <AudioPlayer src={getMediaUrl(question.audio_url) ?? ""} />
              </div>
            )}

            {question.image_url && (
              <img
                src={getMediaUrl(question.image_url) ?? ""}
                alt="Question"
                className="w-full rounded-lg border shadow-sm"
              />
            )}

            {question.question_text && (
              <div className="prose prose-sm max-w-none">
                <p className="font-medium text-base">
                  {question.question_text}
                </p>
              </div>
            )}
          </div>

          {/* COLONNE DROITE : Options de réponse */}
          <div className="flex flex-col justify-center">
            <RadioGroup
              value={selectedAnswer}
              onValueChange={(value) => onAnswerChange(question.id, value)}
              disabled={disabled}
            >
              <div className="space-y-3">
                {[
                  { id: "A", label: question.option_a },
                  { id: "B", label: question.option_b },
                  { id: "C", label: question.option_c },
                  { id: "D", label: question.option_d },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center space-x-3 rounded-xl border p-4 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RadioGroupItem
                      value={opt.id}
                      id={`${question.id}-${opt.id}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${opt.id}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      <span className="text-muted-foreground mr-2 font-bold">
                        {opt.id}.
                      </span>
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
