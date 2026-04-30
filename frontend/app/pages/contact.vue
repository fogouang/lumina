<template>
  <div>
    <!-- Hero -->
    <section class="contact-hero">
      <div class="container contact-hero__inner">
        <h1 class="contact-hero__title">Contactez-nous</h1>
        <p class="contact-hero__sub">
          Une question ? Notre équipe vous répond sous 24h.
        </p>
      </div>
      <div class="contact-hero__wave">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L60 72C120 64 240 48 360 42.7C480 37 600 43 720 48C840 53 960 59 1080 58.7C1200 59 1320 53 1380 50.7L1440 48V80H0Z"
            fill="var(--bg-ground)"
          />
        </svg>
      </div>
    </section>

    <section class="section section--light">
      <div class="container contact-body">
        <!-- Infos -->
        <div class="contact-infos">
          <div
            v-for="info in infos"
            :key="info.label"
            class="contact-info-item"
          >
            <div class="contact-info-item__icon">
              <i :class="info.icon" />
            </div>
            <div>
              <p class="contact-info-item__label">{{ info.label }}</p>
              <p class="contact-info-item__value">{{ info.value }}</p>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="contact-form-wrap">
          <Form
            v-slot="$form"
            :initial-values="initialValues"
            :resolver="resolver"
            class="contact-form"
            @submit="onSubmit"
          >
            <div class="contact-form__row">
              <div class="contact-form__field">
                <label class="contact-form__label">Nom complet</label>
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
              <div class="contact-form__field">
                <label class="contact-form__label">Email</label>
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

            <div class="contact-form__field">
              <label class="contact-form__label">Sujet</label>
              <Select
                name="subject"
                :options="subjects"
                placeholder="Choisissez un sujet"
                fluid
              />
            </div>

            <div class="contact-form__field">
              <label class="contact-form__label">Message</label>
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
              class="contact-form__btn bg-gradient-primary"
            />
          </Form>
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
    label: "Communition WhatsApp",
    value: "+237 670 88 62 88 ",
  },
  {
    icon: "pi pi-map-marker",
    label: "Localisation",
    value: "Dschang, Cameroun",
  },
];

useHead({ title: "Contact | Lumina TCF" });
</script>

<style scoped>
.contact-hero {
  position: relative;
  background: var(--gradient-primary);
  padding: 3rem 0 5rem;
  text-align: center;
}

.contact-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.contact-hero__title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.contact-hero__sub {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.contact-hero__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.contact-hero__wave svg {
  width: 100%;
  display: block;
}

/* ── Body ──────────────────────────────────────────────────── */
.contact-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
  align-items: start;
}

/* ── Infos ─────────────────────────────────────────────────── */
.contact-infos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
}

.contact-info-item__icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-50);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-info-item__icon i {
  font-size: 1.125rem;
  color: var(--color-primary-600);
}

.contact-info-item__label {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-weight: 500;
  margin: 0 0 0.125rem;
}

.contact-info-item__value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* ── Formulaire ────────────────────────────────────────────── */
.contact-form-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.contact-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.contact-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.contact-form__btn {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
  align-self: flex-start;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .contact-body {
    grid-template-columns: 1fr;
  }
  .contact-infos {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .contact-info-item {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 640px) {
  .contact-form__row {
    grid-template-columns: 1fr;
  }
  .contact-form__btn {
    width: 100% !important;
  }
}
</style>
