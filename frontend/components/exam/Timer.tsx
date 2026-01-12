"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

export default function Timer({ 
  initialSeconds, 
  onTimeUp,
  autoStart = true 
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const getVariant = () => {
    const percentage = (seconds / initialSeconds) * 100;
    if (percentage <= 10) return "destructive";
    if (percentage <= 25) return "secondary";
    return "default";
  };

  return (
    <Badge variant={getVariant()} className="text-lg px-4 py-2">
      <Clock className="mr-2 h-4 w-4" />
      {formatTime(seconds)}
    </Badge>
  );
}