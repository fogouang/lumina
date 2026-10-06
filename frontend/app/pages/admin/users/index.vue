<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Utilisateurs</h1>
        <p class="mt-0.5 text-sm text-muted">
          <span class="font-semibold tabular-nums text-ink">{{ total }}</span> utilisateurs au total
        </p>
      </div>
      <AppButton
        label="Nouvel utilisateur"
        icon="pi pi-plus"
        variant="gradient"
        @click="openCreate"
      />
    </div>

    <!-- Tableau -->
    <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
      <DataTable
        v-model:filters="filters"
        :value="users"
        :loading="loading"
        paginator
        :rows="20"
        :rows-per-page-options="[10, 20, 50]"
        filter-display="row"
        :global-filter-fields="['first_name', 'last_name', 'email', 'role']"
        removable-sort
        striped-rows
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <IconField class="w-full sm:w-72">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters['global'].value"
                placeholder="Rechercher un utilisateur..."
                aria-label="Rechercher un utilisateur"
                fluid
              />
            </IconField>
            <Button
              icon="pi pi-refresh"
              outlined
              rounded
              aria-label="Actualiser"
              :loading="loading"
              @click="fetchUsers"
            />
          </div>
        </template>

        <template #empty>
          <div class="flex flex-col items-center py-12 text-center">
            <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
              <i class="pi pi-users text-2xl" />
            </span>
            <p class="text-sm font-medium text-muted">Aucun utilisateur trouvé.</p>
          </div>
        </template>

        <!-- Utilisateur -->
        <Column field="first_name" header="Utilisateur" sortable style="min-width: 220px">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <span
                class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary/10 font-heading text-xs font-bold text-primary"
              >
                {{ initials(data) }}
              </span>
              <div class="min-w-0">
                <p class="flex items-center gap-2 truncate text-sm font-semibold leading-tight text-ink">
                  {{ data.first_name }} {{ data.last_name }}
                  <span
                    v-if="data.is_ambassador"
                    class="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                  >
                    Ambassadeur
                  </span>
                </p>
                <p class="truncate text-xs text-muted">{{ data.email }}</p>
              </div>
            </div>
          </template>
        </Column>

        <!-- Rôle -->
        <Column field="role" header="Rôle" sortable style="min-width: 130px">
          <template #body="{ data }">
            <Tag :value="roleLabel(data.role)" :severity="roleSeverity(data.role)" rounded />
          </template>
        </Column>

        <!-- Statut -->
        <Column field="is_active" header="Statut" sortable style="min-width: 110px">
          <template #body="{ data }">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="
                data.is_active
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
              "
            >
              <span
                class="size-1.5 rounded-full"
                :class="data.is_active ? 'bg-emerald-500' : 'bg-red-500'"
              />
              {{ data.is_active ? "Actif" : "Inactif" }}
            </span>
          </template>
        </Column>

        <!-- Téléphone -->
        <Column field="phone" header="Téléphone" style="min-width: 140px">
          <template #body="{ data }">
            <span class="text-sm tabular-nums" :class="data.phone ? 'text-ink' : 'text-faint'">
              {{ data.phone ?? "—" }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" style="min-width: 170px" :exportable="false">
          <template #body="{ data }">
            <div class="flex items-center gap-1">
              <Button
                v-tooltip.top="data.is_ambassador ? 'Voir sa fiche ambassadeur' : 'Préparer un contrat ambassadeur'"
                :icon="data.is_ambassador ? 'pi pi-star-fill' : 'pi pi-star'"
                size="small"
                text
                rounded
                :severity="data.is_ambassador ? 'warning' : 'secondary'"
                :aria-label="data.is_ambassador ? 'Voir sa fiche ambassadeur' : 'Préparer un contrat ambassadeur'"
                @click="goToAmbassador(data)"
              />
              <Button
                v-tooltip.top="'Activer abonnement'"
                icon="pi pi-credit-card"
                size="small"
                text
                rounded
                severity="success"
                aria-label="Activer abonnement"
                @click="openActivate(data)"
              />
              <Button
                v-tooltip.top="'Modifier'"
                icon="pi pi-pencil"
                size="small"
                text
                rounded
                severity="secondary"
                aria-label="Modifier"
                @click="openEdit(data)"
              />
              <Button
                v-tooltip.top="'Supprimer'"
                icon="pi pi-trash"
                size="small"
                text
                rounded
                severity="danger"
                aria-label="Supprimer"
                @click="openDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog créer / modifier -->
    <Dialog
      v-model:visible="dialogVisible"
      modal
      :draggable="false"
      :style="{ width: '30rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i :class="editingUser ? 'pi pi-user-edit' : 'pi pi-user-plus'" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="user-first-name" class="text-sm font-semibold text-ink">Prénom</label>
            <InputText id="user-first-name" v-model="form.first_name" placeholder="Prénom" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="user-last-name" class="text-sm font-semibold text-ink">Nom</label>
            <InputText id="user-last-name" v-model="form.last_name" placeholder="Nom" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-email" class="text-sm font-semibold text-ink">Email</label>
          <InputText
            id="user-email"
            v-model="form.email"
            type="email"
            placeholder="email@exemple.com"
            fluid
            :disabled="!!editingUser"
          />
        </div>

        <div v-if="!editingUser" class="flex flex-col gap-1.5">
          <label for="user-password" class="text-sm font-semibold text-ink">Mot de passe</label>
          <Password
            v-model="form.password"
            input-id="user-password"
            placeholder="Mot de passe"
            fluid
            :feedback="false"
            toggle-mask
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-phone" class="text-sm font-semibold text-ink">Téléphone</label>
          <InputText id="user-phone" v-model="form.phone" placeholder="+237..." fluid />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-role" class="text-sm font-semibold text-ink">Rôle</label>
          <Select
            v-model="form.role"
            input-id="user-role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="Choisir un rôle"
            fluid
          />
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="dialogVisible = false" />
        <AppButton
          :label="editingUser ? 'Enregistrer' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          @click="onSave"
        />
      </template>
    </Dialog>

    <!-- Dialog suppression -->
    <Dialog
      v-model:visible="deleteVisible"
      modal
      :draggable="false"
      :style="{ width: '26rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-trash" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Supprimer l'utilisateur</h3>
        </div>
      </template>

      <p class="leading-relaxed text-muted">
        Êtes-vous sûr de vouloir supprimer
        <strong class="text-ink">{{ deletingUser?.first_name }} {{ deletingUser?.last_name }}</strong>
        ? Cette action est irréversible.
      </p>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="deleteVisible = false" />
        <AppButton
          label="Supprimer"
          icon="pi pi-trash"
          variant="danger"
          :loading="saving"
          @click="onDelete"
        />
      </template>
    </Dialog>

    <!-- Dialog activation abonnement -->
    <Dialog
      v-model:visible="activateVisible"
      modal
      :draggable="false"
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <i class="pi pi-credit-card" />
          </span>
          <div class="min-w-0">
            <h3 class="font-heading text-lg font-bold leading-tight text-ink">Activer un abonnement</h3>
            <p class="truncate text-sm text-muted">
              {{ activatingUser?.first_name ?? "" }} {{ activatingUser?.last_name ?? "" }}
            </p>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="activate-plan" class="text-sm font-semibold text-ink">Plan</label>
          <Select
            v-model="activateForm.plan_id"
            input-id="activate-plan"
            :options="planOptions"
            option-label="label"
            option-value="value"
            placeholder="Choisir un plan"
            fluid
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="activate-promo" class="text-sm font-semibold text-ink">
            Code promo <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <InputText
            id="activate-promo"
            v-model="activateForm.promo_code"
            placeholder="Ex : PARTNER10"
            fluid
          />
        </div>
        <Message v-if="activateError" severity="error" :closable="false">
          {{ activateError }}
        </Message>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="activateVisible = false" />
        <AppButton
          label="Activer"
          icon="pi pi-check"
          variant="gradient"
          :loading="activating"
          :disabled="!activateForm.plan_id"
          @click="onActivate"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { UserListResponse } from "#shared/api/models/UserListResponse";
import type { SuccessResponse_list_UserListResponse__ } from "#shared/api/models/SuccessResponse_list_UserListResponse__";
import { useSubscriptionStore } from "~/stores/subscription";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get, post, patch, del } = useApi();
const subscriptionStore = useSubscriptionStore();

const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const users = ref<UserListResponse[]>([]);
const total = ref(0);

const filters = ref({
  global: { value: null as string | null, matchMode: "contains" },
});

const planOptions = computed(() =>
  subscriptionStore.plans.map((p) => ({ label: p.name, value: p.id })),
);

const activateVisible = ref(false);
const activatingUser = ref<UserListResponse | null>(null);
const activating = ref(false);
const activateError = ref<string | null>(null);
const activateForm = reactive({
  plan_id: "",
  promo_code: "",
});

function openActivate(user: UserListResponse) {
  activatingUser.value = user;
  activateForm.plan_id = "";
  activateForm.promo_code = "";
  activateError.value = null;
  activateVisible.value = true;
}

async function onActivate() {
  if (!activatingUser.value) return;
  activating.value = true;
  activateError.value = null;
  try {
    await post("/v1/subscriptions/admin/activate", {
      user_id: activatingUser.value.id,
      plan_id: activateForm.plan_id,
      promo_code: activateForm.promo_code || null,
    });
    toast.add({
      severity: "success",
      summary: "Abonnement activé",
      life: 3000,
    });
    activateVisible.value = false;
  } catch (err: any) {
    activateError.value = err?.data?.message || "Erreur lors de l'activation";
  } finally {
    activating.value = false;
  }
}

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

onMounted(async () => {
  if (!subscriptionStore.plans.length) await subscriptionStore.fetchPlans();
});

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

// ── Ambassadeur ───────────────────────────────────────────────
// Le statut ambassadeur ne se donne plus ici : il découle de la
// signature d'un contrat (page Contrats) et se retire par sa résiliation.
function goToAmbassador(user: UserListResponse) {
  if ((user as any).is_ambassador) {
    navigateTo(`/admin/referrals/${user.id}`);
    return;
  }
  navigateTo({
    path: "/admin/contrats-ambassadeurs",
    query: {
      user_id: user.id,
      name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      email: user.email,
    },
  });
}

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
  form.phone = (user as any).phone ?? "";
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

useHead({ title: "Utilisateurs | Admin OCANADA" });
</script>