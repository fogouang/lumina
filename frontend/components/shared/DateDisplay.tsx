import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateDisplayProps {
  date: string | Date;
  formatStr?: string;
  relative?: boolean;
  className?: string;
}

// Alias de formats prédéfinis
const FORMAT_ALIASES: Record<string, string> = {
  short: "dd/MM/yyyy",
  medium: "d MMMM yyyy",
  long: "d MMMM yyyy 'à' HH:mm",
  full: "EEEE d MMMM yyyy 'à' HH:mm",
  time: "HH:mm",
  datetime: "dd/MM/yyyy HH:mm",
};

export default function DateDisplay({
  date,
  formatStr = "d MMMM yyyy 'à' HH:mm",
  className,
}: DateDisplayProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Protection si la date est invalide
  if (isNaN(dateObj.getTime())) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Date invalide
      </span>
    );
  }

  // ✅ Résoudre les alias
  const resolvedFormat = FORMAT_ALIASES[formatStr] || formatStr;

  try {
    return (
      <time
        dateTime={dateObj.toISOString()}
        className={cn("text-sm text-muted-foreground", className)}
      >
        {format(dateObj, resolvedFormat, { locale: fr })}
      </time>
    );
  } catch (error) {
    console.error("Date format error:", error, "Format string:", formatStr);
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {dateObj.toLocaleDateString('fr-FR')}
      </span>
    );
  }
}