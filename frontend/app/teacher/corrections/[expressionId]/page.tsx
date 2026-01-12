"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import CorrectionForm from "@/components/teacher/CorrectionForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";

export default function CorrectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expressionId = params.expressionId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Fetch depuis API
  const expression = {
    id: expressionId,
    student_name: "Marie Dupont",
    task_type: "Expression Écrite - Tâche 1",
    student_text: "Cher ami,\n\nJe t'invite à mon anniversaire...",
    max_score: 15,
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    // TODO: Submit correction via API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    router.push("/teacher/corrections/pending");
  };

  if (!expression) {
    return <LoadingSpinner className="py-8" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/teacher/corrections/pending")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Correction - ${expression.student_name}`}
          description={expression.task_type}
        />
      </div>

      <CorrectionForm
        studentText={expression.student_text}
        maxScore={expression.max_score}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />
    </div>
  );
}