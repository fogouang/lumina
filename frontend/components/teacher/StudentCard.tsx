import { User, Mail, Trophy, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentCardProps {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avg_score?: number;
    subscription_end: string;
    is_active: boolean;
  };
  onViewProfile: (studentId: string) => void;
}

export default function StudentCard({
  student,
  onViewProfile,
}: StudentCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(student.first_name, student.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">
              {student.first_name} {student.last_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {student.email}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tentatives</span>
          </div>
          {/* <Badge variant="outline">{student.attempts_count}</Badge> */}
        </div>

        {student.avg_score !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Score moyen</span>
            </div>
            <span className="font-medium">{student.avg_score}%</span>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewProfile(student.id)}
        >
          Voir le profil
        </Button>
      </CardContent>
    </Card>
  );
}
