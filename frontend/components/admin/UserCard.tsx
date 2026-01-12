import { MoreVertical, Edit, Trash2, Mail, Phone, Shield, ShieldOff } from "lucide-react";
import { UserListResponse, UserRole } from "@/lib/api";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserCardProps {
  user: UserListResponse;
  onEdit: (user: UserListResponse) => void;
  onDelete: (userId: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const getRoleBadge = (role: UserRole) => {
    const config = {
      [UserRole.PLATFORM_ADMIN]: { label: "Admin", variant: "destructive" as const },
      [UserRole.ORG_ADMIN]: { label: "Admin Org", variant: "default" as const },
      [UserRole.TEACHER]: { label: "Enseignant", variant: "secondary" as const },
      [UserRole.STUDENT]: { label: "Étudiant", variant: "outline" as const },
    };
    return config[role];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                {user.email}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rôle</span>
          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Statut</span>
          <Badge variant={user.is_active ? "default" : "secondary"}>
            {user.is_active ? (
              <>
                <Shield className="mr-1 h-3 w-3" />
                Actif
              </>
            ) : (
              <>
                <ShieldOff className="mr-1 h-3 w-3" />
                Inactif
              </>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}