"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import WordCounter from "./WordCounter";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minWords?: number;
  maxWords?: number;
  disabled?: boolean;
  rows?: number;
}

export default function TextEditor({
  value,
  onChange,
  label,
  placeholder = "Écrivez votre réponse ici...",
  minWords,
  maxWords,
  disabled = false,
  rows = 10,
}: TextEditorProps) {
  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="resize-none font-mono"
      />

      <div className="flex justify-between items-center">
        <WordCounter text={value} min={minWords} max={maxWords} />
        
        {(minWords || maxWords) && (
          <span className="text-xs text-muted-foreground">
            {minWords && maxWords
              ? `Écrivez entre ${minWords} et ${maxWords} mots`
              : minWords
              ? `Minimum ${minWords} mots`
              : `Maximum ${maxWords} mots`}
          </span>
        )}
      </div>
    </div>
  );
}