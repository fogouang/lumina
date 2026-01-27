"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface AudioPlayerProps {
  src: string;
  maxPlays?: number;
  autoPlay?: boolean;
}

export default function AudioPlayer({
  src,
  maxPlays,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setPlayCount((prev) => prev + 1);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    if (autoPlay) {
      audio.play();
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (maxPlays && playCount >= maxPlays) {
        return; // Max plays atteint
      }
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const canPlay = !maxPlays || playCount < maxPlays;

  return (
    <Card className="p-4">
      <audio ref={audioRef} src={src} />

      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-4 w-full">
          {/* Boutons de contrôle (Groupe gauche) */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={restart}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Barre de progression (Centre - prend tout l'espace disponible) */}
          <div className="flex flex-1 items-center gap-2">
            <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer"
            />

            <span className="text-[11px] text-muted-foreground tabular-nums w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume (Groupe droite) */}
          <div className="flex items-center gap-2 w-24 shrink-0">
            <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="cursor-pointer w-8 lg:w-34"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
