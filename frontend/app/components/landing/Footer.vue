<script setup lang="ts">
import { site } from "~/config/site";
import { mainNav } from "~/config/navigation";

const epreuves = mainNav.filter((link) => link.to !== "/");
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-line bg-card">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        class="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]"
      >
        <!-- Marque -->
        <div class="space-y-5">
          <NuxtLink to="/" class="flex items-center gap-3">
            <span
              class="brand-gradient flex size-10 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand"
            >
              {{ site.name.charAt(0) }}
            </span>
            <span class="font-heading text-lg font-bold text-ink">{{
              site.name
            }}</span>
          </NuxtLink>
          <p class="max-w-xs text-sm leading-relaxed text-muted">
            {{ site.description }}
          </p>
          <div class="flex gap-2">
            <a
              v-for="social in site.socials"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener"
              class="flex size-10 items-center justify-center rounded-xl border border-line text-muted transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:brand-gradient"
            >
              <i :class="social.icon" />
            </a>
          </div>
        </div>

        <!-- Épreuves -->
        <div>
          <h3
            class="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-ink"
          >
            Épreuves
          </h3>
          <ul class="space-y-3">
            <li v-for="link in epreuves" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
              >
                <i
                  :class="[
                    link.icon,
                    'text-xs text-faint transition-colors group-hover:text-primary',
                  ]"
                />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Ressources -->
        <div>
          <h3
            class="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-ink"
          >
            Ressources
          </h3>
          <ul class="space-y-3">
            <li v-for="link in site.resources" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-muted transition-colors hover:text-primary"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3
            class="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-ink"
          >
            Contact
          </h3>
          <ul class="space-y-3 text-sm text-muted">
            <li class="flex items-center gap-3">
              <i class="pi pi-envelope text-primary" />
              <a
                :href="`mailto:${site.contact.email}`"
                class="hover:text-primary"
                >{{ site.contact.email }}</a
              >
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-phone text-primary" />
              <span>{{ site.contact.phone }}</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-map-marker text-primary" />
              <span>{{ site.contact.address }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 flex flex-col gap-4 border-t border-line pt-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between"
      >
        <p>
          © {{ year }} {{ site.name }}. Tous droits réservés.
          <span class="mx-1.5">·</span>
          Un produit de

          <a
            :href="site.company.url"
            target="_blank"
            rel="noopener"
            class="font-semibold text-muted transition-colors hover:text-primary"
          >
            {{ site.company.name }}
          </a>
        </p>
        <div class="flex gap-6">
          <a href="/politique-confidentialite" class="hover:text-primary">Mentions légales</a>
          <a href="/condition-remboursement" class="hover:text-primary">Confidentialité</a>
        </div>
      </div>
    </div>
  </footer>
</template>
