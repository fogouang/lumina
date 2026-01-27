"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "./AudioPlayer";
import { QuestionResponse, QuestionType } from "@/lib/api";
import { getMediaUrl } from "@/lib/media-path";
import { useState } from "react";
import { ZoomIn, X } from "lucide-react";

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
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  return (
    <>
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
          {/* ✅ DÉCIDER DU LAYOUT selon le contenu */}
          <div
            className={
              // 2 colonnes si: Oral OU (Écrit avec image)
              question.type === QuestionType.ORAL || question.image_url
                ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
                : "space-y-8" // 1 colonne si: Écrit avec texte
            }
          >
            {/* COLONNE/SECTION GAUCHE : Contenu */}
            <div className="space-y-4">
              {/* Audio */}
              {question.audio_url && (
                <div className="bg-muted/30 p-2 rounded-lg">
                  <AudioPlayer src={getMediaUrl(question.audio_url) ?? ""} />
                </div>
              )}

              {question.type === QuestionType.ORAL ? (
                <>
                  {/* CO: Image optionnelle */}
                  {question.image_url && (
                    <div className="relative group">
                      <img
                        src={getMediaUrl(question.image_url) ?? ""}
                        alt="Illustration de la question orale"
                        className="w-full rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setIsImageZoomed(true)}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* CE: Image OU Texte */}
                  {question.image_url ? (
                    <div className="relative group">
                      <img
                        src={getMediaUrl(question.image_url) ?? ""}
                        alt="Document de la question écrite"
                        className="w-full rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setIsImageZoomed(true)}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    question.question_text && (
                      <div className="relative">
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-md z-10">
                          📄 Document
                        </div>
                        <div className="bg-emerald-500/10 dark:from-blue-950/30 dark:to-slate-900 p-6 rounded-xl border-2 border-emerald-200 dark:border-blue-700 shadow-lg">
                          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-500 to-emerald-700 rounded-t-xl"></div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-[20px] leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
                              {question.question_text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Question posée */}
                  {question.asked_question && (
                    <div className="relative">
                      <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-md z-10">
                        ❓ Question
                      </div>
                      <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
                        <p className="font-bold text-base text-emerald-900 dark:text-emerald-100 leading-relaxed">
                          {question.asked_question}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* COLONNE/SECTION DROITE : Options */}
            <div className="flex flex-col justify-center">
              <RadioGroup
                value={selectedAnswer || ""}
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
                        className="text-[18px] flex-1 cursor-pointer font-medium"
                      >
                        <span className="text-muted-foreground mr-2 font-bold uppercase">
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

      {/* Modal de zoom pour l'image */}
      {isImageZoomed && question.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={() => setIsImageZoomed(false)}
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={getMediaUrl(question.image_url) ?? ""}
            alt="Question agrandie"
            className="max-w-full max-h-[95vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}