import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ModuleResult {
  name: string;
  score: number;
  maxScore: number;
}

interface ResultsCardProps {
  modules: ModuleResult[];
  totalScore: number;
  maxScore: number;
}

export default function ResultsCard({ modules, totalScore, maxScore }: ResultsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats par module</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {modules.map((module, index) => {
          const percentage = Math.round((module.score / module.maxScore) * 100);
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{module.name}</span>
                <span className="text-sm text-muted-foreground">
                  {module.score} / {module.maxScore} ({percentage}%)
                </span>
              </div>
              <Progress value={percentage} />
              {index < modules.length - 1 && <Separator className="mt-4" />}
            </div>
          );
        })}

        <Separator />

        {/* Total */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-bold">Score Total</span>
            <span className="text-2xl font-bold text-primary">
              {totalScore} / {maxScore}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}