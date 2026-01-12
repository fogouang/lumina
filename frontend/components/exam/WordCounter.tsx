"use client";

import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WordCounterProps {
  text: string;
  min?: number;
  max?: number;
}

export default function WordCounter({ text, min, max }: WordCounterProps) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const getVariant = () => {
    if (min && max) {
      if (wordCount < min) return "secondary";
      if (wordCount > max) return "destructive";
      return "default";
    }
    return "outline";
  };

  const getMessage = () => {
    if (min && max) {
      if (wordCount < min) return `Min: ${min} mots`;
      if (wordCount > max) return `Max: ${max} mots`;
      return `${min}-${max} mots`;
    }
    return "Nombre de mots";
  };

  return (
    <Badge variant={getVariant()} className="gap-2">
      <FileText className="h-3 w-3" />
      <span>{wordCount} mots</span>
      {(min || max) && (
        <span className="text-xs opacity-70">({getMessage()})</span>
      )}
    </Badge>
  );
}