<template>
  <div>
    <!-- Hero -->
    <section class="featured-panel px-4 pb-44 pt-32 sm:px-6 lg:px-8 lg:pt-40">
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />

      <div class="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <span
          v-reveal
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md"
        >
          <span class="size-1.5 rounded-full bg-accent-400" />
          Contact
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="mt-6 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          Parlons de votre <span class="text-accent-400">préparation</span>
        </h1>
        <p v-reveal="{ delay: 200 }" class="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
          Une question ? Notre équipe vous répond sous {{ site.contact.responseTime }}.
        </p>
      </div>
    </section>

    <!-- Contenu : chevauche le bas du hero -->
    <section class="relative z-10 -mt-28 px-4 pb-24 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
        <!-- Infos -->
        <div class="flex flex-col gap-4 max-lg:order-2">
          <component
            :is="info.href ? 'a' : 'div'"
            v-for="(info, i) in infos"
            :key="info.label"
            v-reveal="{ from: 'left', delay: 200 + i * 100 }"
            :href="info.href"
            :target="info.external ? '_blank' : undefined"
            :rel="info.external ? 'noopener' : undefined"
            class="group flex items-center gap-4 rounded-card border border-line bg-card p-5 shadow-lift transition-all duration-300 ease-spring"
            :class="info.href ? 'hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-800' : ''"
          >
            <span
              class="grid size-12 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 ease-spring dark:bg-primary-950 dark:text-primary-300"
              :class="info.href ? 'group-hover:brand-gradient group-hover:text-white group-hover:shadow-brand' : ''"
            >
              <i :class="[info.icon, 'text-lg']" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-faint">{{ info.label }}</p>
              <p class="truncate text-[0.9375rem] font-semibold text-ink">{{ info.value }}</p>
            </div>
            <i
              v-if="info.href"
              class="pi pi-arrow-up-right text-xs text-faint transition-all duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </component>

          <div
            v-reveal="{ from: 'left', delay: 500 }"
            class="featured-panel rounded-[2rem_0.5rem] p-6 text-white shadow-brand"
          >
            <span class="grid size-11 place-items-center rounded-[0.95rem_0.3rem] bg-accent-400 text-accent-950">
              <i class="pi pi-clock" />
            </span>
            <p class="mt-4 font-heading text-lg font-bold">Réponse sous {{ site.contact.responseTime }}</p>
            <p class="mt-1 text-sm text-white/80">
              Pour une réponse plus rapide, écrivez-nous directement sur WhatsApp.
            </p>
          </div>
        </div>

        <!-- Formulaire -->
        <div v-reveal="{ delay: 150 }" class="max-lg:order-1">
          <div class="rounded-[2rem_0.5rem] border border-line bg-card p-7 shadow-lift sm:p-10">
            <div class="flex items-center gap-3">
              <span class="brand-gradient grid size-11 place-items-center rounded-leaf text-white shadow-brand">
                <i class="pi pi-send" />
              </span>
              <div>
                <h2 class="font-heading text-xl font-bold text-ink">Envoyez-nous un message</h2>
                <p class="text-sm text-faint">Tous les champs sont obligatoires, sauf le sujet.</p>
              </div>
            </div>

            <Form
              v-slot="$form"
              :initial-values="initialValues"
              :resolver="resolver"
              class="mt-8 flex flex-col gap-5"
              @submit="onSubmit"
            >
              <div class="grid gap-5 sm:grid-cols-2">
                <div class="flex flex-col gap-2">
                  <label for="contact-name" class="text-sm font-semibold text-ink">Nom complet</label>
                  <InputText
                    id="contact-name"
                    name="name"
                    placeholder="Jean Dupont"
                    fluid
                    :invalid="$form.name?.invalid"
                  />
                  <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.name.error.message }}
                  </Message>
                </div>

                <div class="flex flex-col gap-2">
                  <label for="contact-email" class="text-sm font-semibold text-ink">Email</label>
                  <InputText
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    fluid
                    :invalid="$form.email?.invalid"
                  />
                  <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.email.error.message }}
                  </Message>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="contact-subject" class="text-sm font-semibold text-ink">Sujet</label>
                <Select
                  input-id="contact-subject"
                  name="subject"
                  :options="subjects"
                  placeholder="Choisissez un sujet"
                  fluid
                />
              </div>

              <div class="flex flex-col gap-2">
                <label for="contact-message" class="text-sm font-semibold text-ink">Message</label>
                <Textarea
                  id="contact-message"
                  name="message"
                  placeholder="Décrivez votre question..."
                  rows="6"
                  auto-resize
                  fluid
                  :invalid="$form.message?.invalid"
                />
                <Message v-if="$form.message?.invalid" severity="error" size="small" variant="simple">
                  {{ $form.message.error.message }}
                </Message>
              </div>

              <Transition
                enter-active-class="transition-all duration-500 ease-spring"
                enter-from-class="opacity-0 translate-y-2"
              >
                <div
                  v-if="success"
                  class="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
                >
                  <i class="pi pi-check-circle mt-0.5 text-green-600 dark:text-green-400" />
                  <p class="text-sm font-medium text-green-800 dark:text-green-300">
                    Message envoyé ! Nous vous répondrons sous {{ site.contact.responseTime }}.
                  </p>
                </div>
              </Transition>

              <div class="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-xs text-faint">
                  Vos données sont traitées selon notre politique de confidentialité.
                </p>
                <AppButton
                  type="submit"
                  label="Envoyer le message"
                  icon="pi pi-send"
                  icon-pos="right"
                  variant="gradient"
                  size="large"
                  :loading="loading"
                  class="max-sm:w-full"
                />
              </div>
            </Form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { site } from "~/config/site";

definePageMeta({ navbarOverlay: true });

const loading = ref(false);
const success = ref(false);

const initialValues = { name: "", email: "", subject: "", message: "" };

const resolver = zodResolver(
  z.object({
    name: z.string().min(2, { message: "Nom requis." }),
    email: z.string().email({ message: "Email invalide." }),
    subject: z.string().optional(),
    message: z
      .string()
      .min(10, { message: "Message trop court (min 10 caractères)." }),
  }),
);

const subjects = [
  "Problème technique",
  "Question sur un abonnement",
  "Remboursement",
  "Suggestion",
  "Autre",
];

async function onSubmit({
  valid,
  values,
}: {
  valid: boolean;
  values: Record<string, string>;
}) {
  if (!valid) return;
  loading.value = true;
  // TODO : appel API contact
  await new Promise((r) => setTimeout(r, 1000));
  loading.value = false;
  success.value = true;
}

const infos = [
  {
    icon: "pi pi-envelope",
    label: "Email",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    external: false,
  },
  {
    icon: "pi pi-whatsapp",
    label: "Communication WhatsApp",
    value: site.contact.phone,
    href: `https://wa.me/${site.contact.whatsapp}`,
    external: true,
  },
  {
    icon: "pi pi-map-marker",
    label: "Localisation",
    value: site.contact.address,
    href: undefined,
    external: false,
  },
];

useHead({ title: `Contact | ${site.name}` });
</script>