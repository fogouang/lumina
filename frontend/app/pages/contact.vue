<template>
  <div>
    <!-- Hero -->
    <section class="relative bg-gradient-primary pb-20 pt-12 text-center">
      <div class="container relative z-10 flex flex-col items-center gap-3">
        <h1 class="m-0 text-[clamp(2rem,4vw,3rem)] font-extrabold text-white">
          Contactez-nous
        </h1>
        <p class="m-0 text-[1.0625rem] text-white/80">
          Une question ? Notre équipe vous répond sous 24h.
        </p>
      </div>
    </section>

    <section class="section border-t-0! bg-(--bg-ground) py-16">
      <div class="container">
        <div ref="bodyRef">
          <Transition name="p-collapsible">
            <div v-if="bodyVisible" class="grid">
              <div
                class="grid gap-12 overflow-hidden lg:grid-cols-[280px_1fr] lg:items-start"
              >
                <!-- Infos -->
                <div
                  class="flex flex-col gap-4 max-lg:flex-row max-lg:flex-wrap"
                >
                  <div
                    v-for="info in infos"
                    :key="info.label"
                    class="flex items-start gap-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 max-lg:min-w-50 max-lg:flex-1"
                  >
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50"
                    >
                      <i :class="info.icon" class="text-lg text-primary-600" />
                    </div>
                    <div>
                      <p
                        class="m-0 mb-0.5 text-[0.8125rem] font-medium text-(--text-tertiary)"
                      >
                        {{ info.label }}
                      </p>
                      <p
                        class="m-0 text-[0.9375rem] font-semibold text-(--text-primary)"
                      >
                        {{ info.value }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Formulaire -->
                <div
                  class="rounded-3xl border border-(--border-color) bg-(--bg-card) p-8"
                >
                  <Form
                    v-slot="$form"
                    :initial-values="initialValues"
                    :resolver="resolver"
                    class="flex flex-col gap-5"
                    @submit="onSubmit"
                  >
                    <div class="grid gap-4 sm:grid-cols-2">
                      <div class="flex flex-col gap-1.5">
                        <label
                          class="text-sm font-semibold text-(--text-secondary)"
                          >Nom complet</label
                        >
                        <InputText
                          name="name"
                          placeholder="Jean Dupont"
                          fluid
                          :invalid="$form.name?.invalid"
                        />
                        <Message
                          v-if="$form.name?.invalid"
                          severity="error"
                          size="small"
                          variant="simple"
                        >
                          {{ $form.name.error.message }}
                        </Message>
                      </div>
                      <div class="flex flex-col gap-1.5">
                        <label
                          class="text-sm font-semibold text-(--text-secondary)"
                          >Email</label
                        >
                        <InputText
                          name="email"
                          type="email"
                          placeholder="votre@email.com"
                          fluid
                          :invalid="$form.email?.invalid"
                        />
                        <Message
                          v-if="$form.email?.invalid"
                          severity="error"
                          size="small"
                          variant="simple"
                        >
                          {{ $form.email.error.message }}
                        </Message>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label
                        class="text-sm font-semibold text-(--text-secondary)"
                        >Sujet</label
                      >
                      <Select
                        name="subject"
                        :options="subjects"
                        placeholder="Choisissez un sujet"
                        fluid
                      />
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label
                        class="text-sm font-semibold text-(--text-secondary)"
                        >Message</label
                      >
                      <Textarea
                        name="message"
                        placeholder="Décrivez votre question..."
                        rows="5"
                        fluid
                        :invalid="$form.message?.invalid"
                      />
                      <Message
                        v-if="$form.message?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                      >
                        {{ $form.message.error.message }}
                      </Message>
                    </div>

                    <Message v-if="success" severity="success">
                      Message envoyé ! Nous vous répondrons sous 24h.
                    </Message>

                    <Button
                      type="submit"
                      label="Envoyer le message"
                      icon="pi pi-send"
                      icon-pos="right"
                      :loading="loading"
                      class="self-start bg-gradient-primary! border-none! rounded-xl! font-bold! max-sm:w-full!"
                    />
                  </Form>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";

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
    value: "support@lumina-tcf.online",
  },
  {
    icon: "pi pi-whatsapp",
    label: "Communication WhatsApp",
    value: "+237 670 88 62 88",
  },
  {
    icon: "pi pi-map-marker",
    label: "Localisation",
    value: "Dschang, Cameroun",
  },
];

const bodyRef = ref(null);
const bodyVisible = ref(false);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        bodyVisible.value = true;
        observer?.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  if (bodyRef.value) observer.observe(bodyRef.value);
});

onUnmounted(() => observer?.disconnect());

useHead({ title: "Contact | Lumina TCF" });
</script>
