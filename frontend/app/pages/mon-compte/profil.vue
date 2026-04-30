<template>
  <div class="account">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <section class="account__hero">
      <div class="container">
        <div class="account__hero-inner">
          <div class="account__avatar">
            <i class="pi pi-user" />
          </div>
          <div>
            <h1 class="account__hero-title">{{ auth.fullName }}</h1>
            <p class="account__hero-sub">{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container account__body">
      <!-- ── Navigation compte ───────────────────────────────── -->
      <div class="account__nav">
        <NuxtLink
          to="/mon-compte"
          class="account__nav-item"
          active-class="account__nav-item--active"
          exact
        >
          <i class="pi pi-user" />
          Mon profil
        </NuxtLink>
        <NuxtLink
          to="/mon-compte/securite"
          class="account__nav-item"
          active-class="account__nav-item--active"
        >
          <i class="pi pi-shield" />
          Sécurité
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="account__nav-item"
          active-class="account__nav-item--active"
        >
          <i class="pi pi-envelope" />
          Support
        </NuxtLink>
        <button
          class="account__nav-item account__nav-item--danger"
          @click="auth.logout()"
        >
          <i class="pi pi-sign-out" />
          Déconnexion
        </button>
      </div>

      <!-- ── Contenu ─────────────────────────────────────────── -->
      <div class="account__content">
        <!-- Informations personnelles -->
        <div class="account-section">
          <h2 class="account-section__title">Informations personnelles</h2>

          <Form
            v-slot="$form"
            :initial-values="initialValues"
            :resolver="resolver"
            class="profil-form"
            @submit="onSubmit"
          >
            <div class="profil-form__row">
              <div class="profil-form__field">
                <label class="profil-form__label">Prénom</label>
                <InputText
                  name="first_name"
                  fluid
                  :invalid="$form.first_name?.invalid"
                />
                <Message
                  v-if="$form.first_name?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.first_name.error.message }}
                </Message>
              </div>
              <div class="profil-form__field">
                <label class="profil-form__label">Nom</label>
                <InputText
                  name="last_name"
                  fluid
                  :invalid="$form.last_name?.invalid"
                />
                <Message
                  v-if="$form.last_name?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.last_name.error.message }}
                </Message>
              </div>
            </div>

            <div class="profil-form__field">
              <label class="profil-form__label">Email</label>
              <InputText
                name="email"
                type="email"
                fluid
                disabled
                class="profil-form__input--disabled"
              />
              <small class="profil-form__hint"
                >L'email ne peut pas être modifié.</small
              >
            </div>

            <div class="profil-form__field">
              <label class="profil-form__label"
                >Téléphone
                <span class="profil-form__optional">(optionnel)</span></label
              >
              <InputText name="phone" type="tel" fluid />
            </div>

            <Message v-if="successMsg" severity="success" size="small">
              {{ successMsg }}
            </Message>
            <Message v-if="errorMsg" severity="error" size="small">
              {{ errorMsg }}
            </Message>

            <div class="profil-form__actions">
              <Button
                type="submit"
                label="Enregistrer les modifications"
                icon="pi pi-check"
                :loading="loading"
                class="profil-form__submit bg-gradient-primary"
              />
            </div>
          </Form>
        </div>

        <!-- Informations compte -->
        <div class="account-section">
          <h2 class="account-section__title">Informations compte</h2>
          <div class="info-list">
            <div class="info-item">
              <span class="info-item__label">Rôle</span>
              <Tag :value="roleLabel" severity="info" />
            </div>
            <div class="info-item">
              <span class="info-item__label">Statut</span>
              <Tag
                :value="auth.user?.is_active ? 'Actif' : 'Inactif'"
                :severity="auth.user?.is_active ? 'success' : 'danger'"
              />
            </div>
            <div class="info-item">
              <span class="info-item__label">Membre depuis</span>
              <span class="info-item__value">{{ memberSince }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { UserUpdate } from "#shared/api/models/UserUpdate";

definePageMeta({ middleware: "auth" });

const auth = useAuthStore();
const { patch } = useApi();
const loading = ref(false);
const successMsg = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

const initialValues = computed(() => ({
  first_name: auth.user?.first_name ?? "",
  last_name: auth.user?.last_name ?? "",
  email: auth.user?.email ?? "",
  phone: auth.user?.phone ?? "",
}));

const resolver = zodResolver(
  z.object({
    first_name: z
      .string()
      .min(2, { message: "Prénom requis (min 2 caractères)." }),
    last_name: z.string().min(2, { message: "Nom requis (min 2 caractères)." }),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
);

async function onSubmit({
  valid,
  values,
}: {
  valid: boolean;
  values: { first_name?: string; last_name?: string; phone?: string };
}) {
  if (!valid) return;
  if (!values.first_name || !values.last_name) return;

  loading.value = true;
  successMsg.value = null;
  errorMsg.value = null;

  try {
    const payload: UserUpdate = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone || null,
    };
    await patch(`/v1/users/${auth.user?.id}`, payload);
    await auth.fetchMe();
    successMsg.value = "Profil mis à jour avec succès.";
  } catch {
    errorMsg.value = "Une erreur est survenue. Veuillez réessayer.";
  } finally {
    loading.value = false;
  }
}

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    platform_admin: "Admin",
    org_admin: "Admin Org.",
    teacher: "Enseignant",
    student: "Étudiant",
  };
  return labels[auth.user?.role ?? ""] ?? auth.user?.role ?? "—";
});

const memberSince = computed(() => {
  if (!auth.user) return "—";
  // UserResponse ne contient pas created_at — on affiche N/A
  return "N/A";
});

useHead({ title: "Mon profil | Lumina TCF" });
</script>

<style scoped>
/* ── Hero (partagé) ────────────────────────────────────────── */
.account__hero {
  background: var(--gradient-primary);
  padding: 2.5rem 0;
}

.account__hero-inner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.account__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account__avatar i {
  font-size: 1.75rem;
  color: #ffffff;
}

.account__hero-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.25rem;
}

.account__hero-sub {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* ── Body ──────────────────────────────────────────────────── */
.account__body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  padding-top: 2rem;
  padding-bottom: 4rem;
  align-items: start;
}

/* ── Nav ───────────────────────────────────────────────────── */
.account__nav {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 88px;
}

.account__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-left: 3px solid transparent;
}

.account__nav-item:hover {
  background: var(--bg-hover);
  color: var(--color-primary-700);
}

.account__nav-item--active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-600);
  font-weight: 600;
}

.account__nav-item--danger {
  color: var(--color-danger-600);
  margin-top: auto;
  border-top: 1px solid var(--border-color);
}

.account__nav-item--danger:hover {
  background: var(--color-danger-50);
  color: var(--color-danger-700);
}

/* ── Sections ──────────────────────────────────────────────── */
.account__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.account-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
}

.account-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

/* ── Formulaire ────────────────────────────────────────────── */
.profil-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.profil-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.profil-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.profil-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.profil-form__optional {
  font-weight: 400;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
}

.profil-form__hint {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.profil-form__input--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profil-form__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.profil-form__submit {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

/* ── Info list ─────────────────────────────────────────────── */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item__label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item__value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .account__body {
    grid-template-columns: 1fr;
  }
  .account__nav {
    flex-direction: row;
    flex-wrap: wrap;
    position: static;
  }
  .account__nav-item--danger {
    border-top: none;
    border-left: 3px solid transparent;
  }
}

@media (max-width: 640px) {
  .profil-form__row {
    grid-template-columns: 1fr;
  }
  .profil-form__actions {
    justify-content: stretch;
  }
  .profil-form__submit {
    width: 100% !important;
  }
}
</style>
