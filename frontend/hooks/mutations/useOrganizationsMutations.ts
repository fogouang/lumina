"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OrganizationsService,
  OrganizationCreate,
  OrganizationUpdate,
  AddAdminRequest,
  AddTeacherRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { ORGANIZATIONS_KEYS } from "../queries/useOrganizationsQueries";

// Créer une organisation
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OrganizationCreate) => {
      const response =
        await OrganizationsService.createOrganizationApiV1OrganizationsPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_KEYS.lists() });
      toast({
        title: "Organisation créée",
        description: "L'organisation a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer l'organisation",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour une organisation
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orgId,
      data,
    }: {
      orgId: string;
      data: OrganizationUpdate;
    }) => {
      const response =
        await OrganizationsService.updateOrganizationApiV1OrganizationsOrgIdPatch(
          orgId,
          data
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_KEYS.detail(variables.orgId),
      });
      toast({
        title: "Organisation mise à jour",
        description: "L'organisation a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour l'organisation",
        variant: "destructive",
      });
    },
  });
};

// Supprimer une organisation
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orgId: string) => {
      const response =
        await OrganizationsService.deleteOrganizationApiV1OrganizationsOrgIdDelete(
          orgId
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_KEYS.lists() });
      toast({
        title: "Organisation supprimée",
        description: "L'organisation a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    },
  });
};

// Ajouter un admin
export const useAddAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orgId,
      data,
    }: {
      orgId: string;
      data: AddAdminRequest;
    }) => {
      const response =
        await OrganizationsService.addAdminApiV1OrganizationsOrgIdAdminsPost(
          orgId,
          data
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_KEYS.detail(variables.orgId),
      });
      toast({
        title: "Admin ajouté",
        description: "L'administrateur a été ajouté à l'organisation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible d'ajouter l'admin",
        variant: "destructive",
      });
    },
  });
};

// Retirer un admin
export const useRemoveAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orgId, userId }: { orgId: string; userId: string }) => {
      const response =
        await OrganizationsService.removeAdminApiV1OrganizationsOrgIdAdminsUserIdDelete(
          orgId,
          userId
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_KEYS.detail(variables.orgId),
      });
      toast({
        title: "Admin retiré",
        description: "L'administrateur a été retiré de l'organisation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de retirer l'admin",
        variant: "destructive",
      });
    },
  });
};

// Ajouter un teacher
export const useAddTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orgId,
      data,
    }: {
      orgId: string;
      data: AddTeacherRequest;
    }) => {
      const response =
        await OrganizationsService.addTeacherApiV1OrganizationsOrgIdTeachersPost(
          orgId,
          data
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_KEYS.detail(variables.orgId),
      });
      toast({
        title: "Enseignant ajouté",
        description: "L'enseignant a été ajouté à l'organisation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible d'ajouter l'enseignant",
        variant: "destructive",
      });
    },
  });
};

// Retirer un teacher
export const useRemoveTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orgId, userId }: { orgId: string; userId: string }) => {
      const response =
        await OrganizationsService.removeTeacherApiV1OrganizationsOrgIdTeachersUserIdDelete(
          orgId,
          userId
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_KEYS.detail(variables.orgId),
      });
      toast({
        title: "Enseignant retiré",
        description: "L'enseignant a été retiré de l'organisation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de retirer l'enseignant",
        variant: "destructive",
      });
    },
  });
};