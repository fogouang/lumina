"use client";

import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Timer from "./Timer";

interface AudioRecorderProps {
  maxDuration: number; // en secondes
  onRecordingComplete: (audioBlob: Blob) => void;
}

export default function AudioRecorder({ 
  maxDuration, 
  onRecordingComplete 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete(blob);
        
        // Arrêter le stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Erreur accès micro:", error);
      alert("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* État */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Enregistrement audio</h3>
            <p className="text-sm text-muted-foreground">
              Durée max: {formatTime(maxDuration)}
            </p>
          </div>
          
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Mic className="mr-1 h-3 w-3" />
              Enregistrement...
            </Badge>
          )}
        </div>

        {/* Timer pendant l'enregistrement */}
        {isRecording && (
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </div>
          </div>
        )}

        {/* Audio player (si enregistré) */}
        {audioUrl && !isRecording && (
          <div className="bg-muted p-4 rounded-lg">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Écouter
                  </>
                )}
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Durée: {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Boutons de contrôle */}
        <div className="flex gap-2">
          {!isRecording && !audioBlob && (
            <Button 
              className="flex-1"
              onClick={startRecording}
            >
              <Mic className="mr-2 h-4 w-4" />
              Démarrer l'enregistrement
            </Button>
          )}

          {isRecording && (
            <Button 
              className="flex-1"
              variant="destructive"
              onClick={stopRecording}
            >
              <Square className="mr-2 h-4 w-4" />
              Arrêter
            </Button>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button 
                className="flex-1"
                onClick={startRecording}
              >
                <Mic className="mr-2 h-4 w-4" />
                Réenregistrer
              </Button>
              
              <Button
                variant="destructive"
                onClick={deleteRecording}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}