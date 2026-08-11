<template>
  <footer
    class="relative border-t border-(--border-color) bg-(--bg-section) text-(--text-primary) shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)]"
  >
    <div class="container pb-8 pt-20">
      <div
        class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] m-4"
      >
        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <img
            src="/images/logo.png"
            alt="Lumina TCF"
            class="mb-4 h-10 object-contain"
          />
          <p
            class="max-w-85 text-[0.9rem] leading-[1.7] text-(--text-secondary)"
          >
            Votre plateforme de préparation au TCF Canada. Simulations en
            conditions réelles, correction IA et suivi de progression
            personnalisé.
          </p>

          <div class="mt-6 flex gap-1">
            <Button
              icon="pi pi-youtube"
              rounded
              text
              aria-label="YouTube"
              class="text-(--text-secondary)! hover:bg-(--bg-hover)! hover:text-primary-600!"
            />
            <Button
              icon="pi pi-whatsapp"
              rounded
              text
              aria-label="WhatsApp"
              class="text-(--text-secondary)! hover:bg-(--bg-hover)! hover:text-primary-600!"
            />
            <Button
              icon="pi pi-instagram"
              rounded
              text
              aria-label="Instagram"
              class="text-(--text-secondary)! hover:bg-(--bg-hover)! hover:text-primary-600!"
            />
            <Button
              icon="pi pi-facebook"
              rounded
              text
              aria-label="Facebook"
              class="text-(--text-secondary)! hover:bg-(--bg-hover)! hover:text-primary-600!"
            />
          </div>

          <!-- Newsletter -->
          <div class="mt-6">
            <p class="mb-2.5 text-sm font-semibold text-(--text-primary)">
              Restez informé
            </p>
            <div class="flex gap-2">
              <InputText
                placeholder="Votre email"
                class="flex-1 bg-(--bg-card)! border-(--border-color)! text-(--text-primary)!"
              />
              <Button
                icon="pi pi-arrow-right"
                aria-label="S’abonner"
                class="shrink-0 bg-gradient-primary! border-none! text-white!"
              />
            </div>
          </div>
        </div>

        <!-- Ressources -->
        <div>
          <h3
            class="mb-4 flex items-center gap-2 text-base font-bold text-(--text-primary)"
          >
            <i class="pi pi-compass text-[0.9375rem] text-primary-600" />
            Ressources
          </h3>
          <ul class="flex flex-col gap-2.5 list-none p-0 m-0">
            <li v-for="link in ressourcesLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="group flex items-center gap-2 text-sm text-(--text-secondary) no-underline transition-colors hover:text-primary-700"
              >
                <i
                  class="pi pi-angle-right text-xs transition-transform group-hover:translate-x-0.75"
                />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- À propos -->
        <div>
          <h3
            class="mb-4 flex items-center gap-2 text-base font-bold text-(--text-primary)"
          >
            <i class="pi pi-info-circle text-[0.9375rem] text-primary-600" />
            À propos
          </h3>
          <ul class="flex flex-col gap-2.5 list-none p-0 m-0">
            <li v-for="link in aproposLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="group flex items-center gap-2 text-sm text-(--text-secondary) no-underline transition-colors hover:text-primary-700"
              >
                <i
                  class="pi pi-angle-right text-xs transition-transform group-hover:translate-x-0.75"
                />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <Divider class="border-(--border-color)! my-8!" />

      <!-- Bottom -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <span class="text-sm text-(--text-secondary)">
          © {{ new Date().getFullYear() }} <strong>Lumina TCF</strong> -
          Fogouang Corporation. Tous droits réservés.
        </span>
        <div class="flex flex-wrap items-center gap-3">
          <Tag
            value="Version 2026"
            class="bg-primary-50! text-primary-700! border! border-primary-200!"
          />
          <Tag
            value="Correction IA"
            class="bg-primary-50! text-primary-700! border! border-primary-200!"
          />
          <div
            class="flex items-center gap-1.5 text-sm text-(--text-secondary)"
          >
            <i class="pi pi-shield text-primary-600" />
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const ressourcesLinks = [
  { to: "/politique-confidentialite", label: "Confidentialité" },
  { to: "/condition-remboursemnet", label: "Condition de remboursement" },
];

const aproposLinks = [
  { to: "/tarifs", label: "Tarifs" },
  { to: "/contact", label: "Contact" },
];
</script>
