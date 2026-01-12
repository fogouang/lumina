import { Trophy } from "lucide-react";
import CECRLBadge from "./CECRLBadge";

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  cecrlLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  size?: "sm" | "md" | "lg";
}

export default function ScoreDisplay({ 
  score, 
  maxScore, 
  cecrlLevel,
  size = "md" 
}: ScoreDisplayProps) {
  const percentage = Math.round((score / maxScore) * 100);
  
  const sizeClasses = {
    sm: { text: "text-2xl", subtext: "text-sm" },
    md: { text: "text-4xl", subtext: "text-base" },
    lg: { text: "text-6xl", subtext: "text-xl" },
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`${sizeClasses[size].text} font-bold ${getScoreColor(percentage)}`}>
          {score} <span className="text-muted-foreground">/ {maxScore}</span>
        </div>
        <div className={`${sizeClasses[size].subtext} text-center text-muted-foreground`}>
          {percentage}%
        </div>
      </div>

      {cecrlLevel && (
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <CECRLBadge level={cecrlLevel} size={size} />
        </div>
      )}
    </div>
  );
}