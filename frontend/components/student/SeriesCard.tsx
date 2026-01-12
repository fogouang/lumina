import { FileText, Clock, ChevronRight, Lock } from "lucide-react";
import { SeriesListResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SeriesCardProps {
  series: SeriesListResponse;
  onSelect: (seriesId: string) => void;
  isLocked?: boolean;
}

export default function SeriesCard({
  series,
  onSelect,
  isLocked = false,
}: SeriesCardProps) {
  const displayTitle = series.title ?? `Série ${series.number}`;

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        isLocked ? "opacity-75" : "cursor-pointer"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{displayTitle}</CardTitle>
              {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <CardDescription>Série n°{series.number}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">Compréhension Orale</Badge>
          <Badge variant="outline">Compréhension Écrite</Badge>
          <Badge variant="outline">Expression Écrite</Badge>
          <Badge variant="outline">Expression Orale</Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onSelect(series.id)}
          disabled={!series.is_active}
          variant={isLocked ? "default" : "default"}
        >
          {isLocked ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Abonnement requis
            </>
          ) : (
            <>
              Voir les détails
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
