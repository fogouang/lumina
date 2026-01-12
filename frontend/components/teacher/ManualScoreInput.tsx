"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManualScoreInputProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
}

export default function ManualScoreInput({ 
  value, 
  onChange, 
  max 
}: ManualScoreInputProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Note</Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={0}
            max={max}
            className="w-20 text-center"
          />
          <span className="text-sm text-muted-foreground">/ {max}</span>
          <span className="text-sm font-medium">({percentage}%)</span>
        </div>
      </div>

      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={max}
        step={0.5}
        className="w-full"
      />

      <div className="grid grid-cols-5 gap-2">
        {[0, 25, 50, 75, 100].map((percent) => {
          const scoreValue = Math.round((max * percent) / 100);
          return (
            <button
              key={percent}
              onClick={() => onChange(scoreValue)}
              className="text-xs py-1 px-2 rounded border hover:bg-muted transition-colors"
            >
              {percent}%
            </button>
          );
        })}
      </div>
    </div>
  );
}