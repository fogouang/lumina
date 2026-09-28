<script setup lang="ts">
import type { NewClient } from "~/types/client";

const visible = defineModel<boolean>("visible", { default: false });
const { addClient } = useClients();

const cities = ["Yaoundé", "Douala", "Dschang", "Bafoussam", "Garoua", "Bamenda"];
const statusOptions = [
  { label: "Actif", value: "active" },
  { label: "Prospect", value: "prospect" },
  { label: "Inactif", value: "inactive" },
];

const empty = (): NewClient => ({
  name: "",
  email: "",
  phone: "",
  company: "",
  city: "",
  status: "prospect",
});

const form = reactive<NewClient>(empty());
const errors = reactive<Partial<Record<keyof NewClient, string>>>({});
const submitted = ref(false);
const saving = ref(false);

function clearErrors() {
  for (const key in errors) delete errors[key as keyof NewClient];
}

function validate() {
  clearErrors();
  if (!form.name.trim()) errors.name = "Le nom est obligatoire";
  if (!form.email.trim()) errors.email = "L'email est obligatoire";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email invalide";
  if (!form.city) errors.city = "Choisis une ville";
  return Object.keys(errors).length === 0;
}

async function submit() {
  submitted.value = true;
  if (!validate()) return;

  saving.value = true;
  await new Promise((r) => setTimeout(r, 600)); // simule l'appel API
  addClient({ ...form });
  saving.value = false;
  visible.value = false;
}

// Revalide pendant la saisie, mais seulement après un premier envoi
watch(form, () => {
  if (submitted.value) validate();
}, { deep: true });

// Remet le formulaire à zéro à la fermeture
watch(visible, (open) => {
  if (!open) {
    Object.assign(form, empty());
    clearErrors();
    submitted.value = false;
  }
});
</script>

<template>
  <AppDialog
    v-model:visible="visible"
    title="Nouveau client"
    subtitle="Les champs marqués * sont obligatoires"
    icon="pi pi-user-plus"
    confirm-label="Ajouter"
    width="40rem"
    :loading="saving"
    @confirm="submit"
  >
    <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <div class="flex flex-col gap-1.5 sm:col-span-2">
        <label for="client-name" class="text-sm font-medium text-ink">Nom complet *</label>
        <InputText id="client-name" v-model="form.name" :invalid="!!errors.name" placeholder="Ex. Aline Mbarga" />
        <small v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="client-email" class="text-sm font-medium text-ink">Email *</label>
        <InputText id="client-email" v-model="form.email" type="email" :invalid="!!errors.email" placeholder="nom@entreprise.cm" />
        <small v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</small>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="client-phone" class="text-sm font-medium text-ink">Téléphone</label>
        <InputText id="client-phone" v-model="form.phone" placeholder="+237 6XX XX XX XX" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="client-company" class="text-sm font-medium text-ink">Entreprise</label>
        <InputText id="client-company" v-model="form.company" placeholder="Nom de l'entreprise" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="client-city" class="text-sm font-medium text-ink">Ville *</label>
        <Select
          v-model="form.city"
          input-id="client-city"
          :options="cities"
          :invalid="!!errors.city"
          placeholder="Choisir une ville"
        />
        <small v-if="errors.city" class="text-xs text-red-500">{{ errors.city }}</small>
      </div>

      <div class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-sm font-medium text-ink">Statut</span>
        <SelectButton
          v-model="form.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
        />
      </div>

      <!-- Permet de valider avec la touche Entrée -->
      <button type="submit" class="hidden" />
    </form>
  </AppDialog>
</template>