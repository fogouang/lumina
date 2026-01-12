"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Upload, Filter } from "lucide-react";
import Link from "next/link";
import { QuestionResponse, QuestionType } from "@/lib/api";
import { useQuestionsList } from "@/hooks/queries/useQuestionsQueries";
import { useDeleteQuestion } from "@/hooks/mutations/useQuestionsMutations";
import QuestionCard from "@/components/admin/QuestionCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import QuestionForm from "@/components/admin/QuestionForm";

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;

  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionResponse | null>(null);

  const {
    data: questions,
    isLoading,
    error,
    refetch,
  } = useQuestionsList(seriesId, questionType);
  const { mutate: deleteQuestion, isPending: isDeleting } = useDeleteQuestion();

  const handleDelete = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!questionToDelete) return;

    deleteQuestion(questionToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
      },
    });
  };

  const handleEdit = (question: QuestionResponse) => {
    setEditingQuestion(question);
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des questions..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les questions"
        retry={() => refetch()}
      />
    );
  }

  const oralQuestions =
    questions?.filter((q) => q.type === QuestionType.ORAL) || [];
  const writtenQuestions =
    questions?.filter((q) => q.type === QuestionType.WRITTEN) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href={ROUTES.ADMIN_SERIES_DETAIL(seriesId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la série
            </Link>
          </Button>

          <PageHeader
            title="Gestion des questions"
            description="Gérer les questions de compréhension de la série"
            actions={
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={ROUTES.ADMIN_SERIES_QUESTIONS_IMPORT(seriesId)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer JSON
                  </Link>
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle question
                </Button>
              </div>
            }
          />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total questions</p>
            <p className="text-2xl font-bold">{questions?.length || 0}/78</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Questions orales</p>
            <p className="text-2xl font-bold">{oralQuestions.length}/39</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Questions écrites</p>
            <p className="text-2xl font-bold">{writtenQuestions.length}/39</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={questionType || "all"}
            onValueChange={(value) =>
              setQuestionType(value === "all" ? null : (value as QuestionType))
            }
          >
            <SelectTrigger className="w-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les questions</SelectItem>
              <SelectItem value={QuestionType.ORAL}>
                Compréhension orale
              </SelectItem>
              <SelectItem value={QuestionType.WRITTEN}>
                Compréhension écrite
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Questions List */}
        {!questions || questions.length === 0 ? (
          <EmptyState
            title="Aucune question"
            description="Commencez par importer des questions depuis un fichier JSON"
            action={{
              label: "Importer des questions",
              onClick: () =>
                router.push(ROUTES.ADMIN_SERIES_QUESTIONS_IMPORT(seriesId)),
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la question"
        description="Cette action est irréversible. La question sera définitivement supprimée."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
      
      {editingQuestion && (
        <QuestionForm
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          question={editingQuestion}
        />
      )}
    </>
  );
}
