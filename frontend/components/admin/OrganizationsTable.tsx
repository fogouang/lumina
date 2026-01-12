import {
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { OrganizationListResponse, OrganizationType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

interface OrganizationsTableProps {
  organizations: OrganizationListResponse[];
  onEdit: (organization: OrganizationListResponse) => void;
  onDelete: (orgId: string) => void;
}

const getTypeBadge = (type: OrganizationType) => {
  const config = {
    [OrganizationType.TRAINING_CENTER]: {
      label: "Centre de formation",
      variant: "default" as const,
    },
    [OrganizationType.RESELLER]: {
      label: "Revendeur",
      variant: "secondary" as const,
    },
  };
  return config[type];
};

export default function OrganizationsTable({
  organizations,
  onEdit,
  onDelete,
}: OrganizationsTableProps) {
  const router = useRouter();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                Aucune organisation trouvée
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((org) => {
              const typeBadge = getTypeBadge(org.type);
              return (
                <TableRow
                  key={org.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(ROUTES.ADMIN_ORGANIZATION_DETAIL(org.id))
                  }
                >
                  {/* Organisation */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{org.name}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {org.email}
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    <Badge variant={org.is_active ? "default" : "secondary"}>
                      {org.is_active ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactif
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(org)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(org.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
