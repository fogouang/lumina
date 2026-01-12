"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface ExamSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  answeredQuestions: number;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ExamSubmitDialog({
  open,
  onOpenChange,
  totalQuestions,
  answeredQuestions,
  onConfirm,
  loading = false,
}: ExamSubmitDialogProps) {
  const unanswered = totalQuestions - answeredQuestions;
  const allAnswered = unanswered === 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {allAnswered ? "Soumettre l'examen ?" : "Attention !"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {!allAnswered && (
              <div className="bg-destructive/10 p-3 rounded-lg">
                <p className="text-destructive font-medium">
                  Vous avez {unanswered} question{unanswered > 1 ? "s" : ""} non répondue
                  {unanswered > 1 ? "s" : ""}.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <div className="text-center">
                <Badge variant="default" className="text-lg px-4 py-2">
                  {answeredQuestions}
                </Badge>
                <p className="text-xs mt-1 text-muted-foreground">Répondues</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {unanswered}
                </Badge>
                <p className="text-xs mt-1 text-muted-foreground">Non répondues</p>
              </div>
            </div>

            <p className="text-center">
              {allAnswered
                ? "Êtes-vous sûr de vouloir soumettre votre examen ?"
                : "Voulez-vous vraiment soumettre sans avoir répondu à toutes les questions ?"}
            </p>
            
            <p className="text-sm text-center text-muted-foreground">
              Cette action est irréversible.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? "Soumission..." : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}