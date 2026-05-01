<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Utilisateurs</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          {{ total }} utilisateurs au total
        </p>
      </div>
      <Button
        label="Nouvel utilisateur"
        icon="pi pi-plus"
        class="border-none font-bold bg-gradient-primary"
        @click="openCreate"
      />
    </div>

    <!-- DataTable -->
    <DataTable
      :value="users"
      :loading="loading"
      paginator
      :rows="20"
      :rows-per-page-options="[10, 20, 50]"
      v-model:filters="filters"
      filter-display="row"
      :global-filter-fields="['first_name', 'last_name', 'email', 'role']"
      removable-sort
      striped-rows
      class="p-datatable-sm"
    >
      <template #header>
        <div class="flex justify-between items-center gap-3">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Rechercher..."
              class="w-64"
            />
          </IconField>
          <Button
            icon="pi pi-refresh"
            outlined
            size="small"
            :loading="loading"
            @click="fetchUsers"
          />
        </div>
      </template>

      <template #empty>
        <div class="text-center py-10 text-(--text-tertiary)">
          <i class="pi pi-users text-4xl mb-3 block opacity-30" />
          <p>Aucun utilisateur trouvé.</p>
        </div>
      </template>

      <!-- Nom -->
      <Column
        field="first_name"
        header="Utilisateur"
        sortable
        style="min-width: 200px"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0"
            >
              <span class="text-xs font-bold text-primary-600">
                {{ initials(data) }}
              </span>
            </div>
            <div>
              <p
                class="text-sm font-semibold text-(--text-primary) leading-tight"
              >
                {{ data.first_name }} {{ data.last_name }}
              </p>
              <p class="text-xs text-(--text-tertiary)">{{ data.email }}</p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Rôle -->
      <Column field="role" header="Rôle" sortable style="min-width: 130px">
        <template #body="{ data }">
          <Tag
            :value="roleLabel(data.role)"
            :severity="roleSeverity(data.role)"
          />
        </template>
      </Column>

      <!-- Statut -->
      <Column
        field="is_active"
        header="Statut"
        sortable
        style="min-width: 100px"
      >
        <template #body="{ data }">
          <Tag
            :value="data.is_active ? 'Actif' : 'Inactif'"
            :severity="data.is_active ? 'success' : 'danger'"
          />
        </template>
      </Column>

      <!-- Phone -->
      <Column field="phone" header="Téléphone" style="min-width: 140px">
        <template #body="{ data }">
          <span class="text-sm text-(--text-secondary)">{{
            data.phone ?? "—"
          }}</span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="min-width: 100px" :exportable="false">
        <template #body="{ data }">
          <div class="flex items-center gap-1">
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              rounded
              severity="secondary"
              v-tooltip.top="'Modifier'"
              @click="openEdit(data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              rounded
              severity="danger"
              v-tooltip.top="'Supprimer'"
              @click="openDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog créer/modifier -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'"
      modal
      :style="{ width: '480px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Prénom</label
            >
            <InputText v-model="form.first_name" placeholder="Prénom" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Nom</label
            >
            <InputText v-model="form.last_name" placeholder="Nom" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Email</label
          >
          <InputText
            v-model="form.email"
            type="email"
            placeholder="email@exemple.com"
            fluid
            :disabled="!!editingUser"
          />
        </div>

        <div class="flex flex-col gap-1.5" v-if="!editingUser">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Mot de passe</label
          >
          <Password
            v-model="form.password"
            placeholder="Mot de passe"
            fluid
            :feedback="false"
            toggleMask
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Téléphone</label
          >
          <InputText v-model="form.phone" placeholder="+237..." fluid />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Rôle</label
          >
          <Select
            v-model="form.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="Choisir un rôle"
            fluid
          />
        </div>
      </div>

      <template #footer>
        <Button label="Annuler" text @click="dialogVisible = false" />
        <Button
          :label="editingUser ? 'Enregistrer' : 'Créer'"
          :loading="saving"
          class="bg-gradient-primary border-none font-bold"
          @click="onSave"
        />
      </template>
    </Dialog>

    <!-- Dialog suppression -->
    <Dialog
      v-model:visible="deleteVisible"
      header="Supprimer l'utilisateur"
      modal
      :style="{ width: '400px' }"
    >
      <p class="text-(--text-secondary) leading-relaxed">
        Êtes-vous sûr de vouloir supprimer
        <strong
          >{{ deletingUser?.first_name }} {{ deletingUser?.last_name }}</strong
        >
        ? Cette action est irréversible.
      </p>
      <template #footer>
        <Button label="Annuler" text @click="deleteVisible = false" />
        <Button
          label="Supprimer"
          severity="danger"
          icon="pi pi-trash"
          :loading="saving"
          @click="onDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { UserListResponse } from "#shared/api/models/UserListResponse";
import type { SuccessResponse_list_UserListResponse__ } from "#shared/api/models/SuccessResponse_list_UserListResponse__";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get, post, patch, del } = useApi();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const users = ref<UserListResponse[]>([]);
const total = ref(0);

const filters = ref({
  global: { value: null as string | null, matchMode: "contains" },
});

// ── Fetch ─────────────────────────────────────────────────────
async function fetchUsers() {
  loading.value = true;
  try {
    const res = await get<SuccessResponse_list_UserListResponse__>(
      "/v1/users?limit=100",
    );
    users.value = res.data ?? [];
    total.value = users.value.length;
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de chargement",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUsers);

// ── Helpers ───────────────────────────────────────────────────
function initials(user: UserListResponse): string {
  return `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    platform_admin: "Admin",
    org_admin: "Admin Org.",
    teacher: "Enseignant",
    student: "Étudiant",
  };
  return labels[role] ?? role;
}

function roleSeverity(role: string): string {
  const map: Record<string, string> = {
    platform_admin: "danger",
    org_admin: "warning",
    teacher: "info",
    student: "secondary",
  };
  return map[role] ?? "secondary";
}

const roleOptions = [
  { label: "Étudiant", value: "student" },
  { label: "Enseignant", value: "teacher" },
  { label: "Admin Org.", value: "org_admin" },
  { label: "Admin", value: "platform_admin" },
];

// ── Formulaire ────────────────────────────────────────────────
const dialogVisible = ref(false);
const editingUser = ref<UserListResponse | null>(null);
const form = reactive({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  role: "student",
});

function openCreate() {
  editingUser.value = null;
  form.first_name = "";
  form.last_name = "";
  form.email = "";
  form.password = "";
  form.phone = "";
  form.role = "student";
  dialogVisible.value = true;
}

function openEdit(user: UserListResponse) {
  editingUser.value = user;
  form.first_name = user.first_name ?? "";
  form.last_name = user.last_name ?? "";
  form.email = user.email ?? "";
  form.password = "";
  form.role = user.role ?? "student";
  dialogVisible.value = true;
}

async function onSave() {
  saving.value = true;
  try {
    if (editingUser.value) {
      await patch(`/v1/users/${editingUser.value.id}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
      });
      toast.add({
        severity: "success",
        summary: "Utilisateur modifié",
        life: 3000,
      });
    } else {
      await post("/v1/users", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        role: form.role,
      });
      toast.add({
        severity: "success",
        summary: "Utilisateur créé",
        life: 3000,
      });
    }
    dialogVisible.value = false;
    await fetchUsers();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

// ── Suppression ───────────────────────────────────────────────
const deleteVisible = ref(false);
const deletingUser = ref<UserListResponse | null>(null);

function openDelete(user: UserListResponse) {
  deletingUser.value = user;
  deleteVisible.value = true;
}

async function onDelete() {
  if (!deletingUser.value) return;
  saving.value = true;
  try {
    await del(`/v1/users/${deletingUser.value.id}`);
    toast.add({
      severity: "success",
      summary: "Utilisateur supprimé",
      life: 3000,
    });
    deleteVisible.value = false;
    await fetchUsers();
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de suppression",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
}

useHead({ title: "Utilisateurs | Admin Lumina" });
</script>
