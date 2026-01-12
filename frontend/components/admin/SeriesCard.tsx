import { MoreVertical, Edit, Trash2, FileJson, Eye } from "lucide-react";
import Link from "next/link";
import { SeriesListResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import { ROUTES } from "@/lib/constants";

interface SeriesCardProps {
  series: SeriesListResponse;
  onEdit: (series: SeriesListResponse) => void;
  onDelete: (seriesId: string) => void;
}

export default function SeriesCard({
  series,
  onEdit,
  onDelete,
}: SeriesCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Série #{series.number}
              {series.is_active ? (
                <StatusBadge status="enabled" />
              ) : (
                <StatusBadge status="disabled" />
              )}
            </CardTitle>
            {series.title && (
              <CardDescription>{series.title}</CardDescription>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.ADMIN_SERIES_DETAIL(series.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(series)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.ADMIN_SERIES_QUESTIONS(series.id)}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Gérer les questions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(series.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Questions orales</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div>
            <p className="text-muted-foreground">Questions écrites</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tâches expression</p>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={ROUTES.ADMIN_SERIES_DETAIL(series.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={ROUTES.ADMIN_SERIES_QUESTIONS(series.id)}>
              <FileJson className="mr-2 h-4 w-4" />
              Questions
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}