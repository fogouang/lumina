"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ManualScoreInput from "./ManualScoreInput";

interface CorrectionFormProps {
  studentText: string;
  maxScore: number;
  onSubmit: (data: {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  }) => void;
  loading?: boolean;
}

export default function CorrectionForm({
  studentText,
  maxScore,
  onSubmit,
  loading = false,
}: CorrectionFormProps) {
  const [score, setScore] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const handleSubmit = () => {
    onSubmit({
      score,
      strengths: strengths.split("\n").filter(Boolean),
      improvements: improvements.split("\n").filter(Boolean),
      suggestions: suggestions.split("\n").filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      {/* Texte de l'étudiant */}
      <Card>
        <CardHeader>
          <CardTitle>Production de l'étudiant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {studentText}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card>
        <CardHeader>
          <CardTitle>Note</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualScoreInput
            value={score}
            onChange={setScore}
            max={maxScore}
          />
        </CardContent>
      </Card>

      {/* Points forts */}
      <Card>
        <CardHeader>
          <CardTitle>Points forts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="strengths">
            Un point par ligne
          </Label>
          <Textarea
            id="strengths"
            placeholder="- Bonne structure&#10;- Vocabulaire approprié&#10;- ..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Points à améliorer */}
      <Card>
        <CardHeader>
          <CardTitle>Points à améliorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="improvements">
            Un point par ligne
          </Label>
          <Textarea
            id="improvements"
            placeholder="- Attention à l'orthographe&#10;- Développer les arguments&#10;- ..."
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="suggestions">
            Un conseil par ligne
          </Label>
          <Textarea
            id="suggestions"
            placeholder="- Utiliser plus de connecteurs logiques&#10;- Varier les temps verbaux&#10;- ..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Button 
        size="lg" 
        className="w-full"
        onClick={handleSubmit}
        disabled={loading || score === 0}
      >
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Enregistrement..." : "Enregistrer la correction"}
      </Button>
    </div>
  );
}