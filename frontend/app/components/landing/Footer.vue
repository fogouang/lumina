<template>
  <footer class="footer">

    <!-- Wave décoratif -->
    <!-- <div class="footer__wave">
      <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0 0L60 8C120 16 240 32 360 37.3C480 43 600 37 720 32C840 27 960 21 1080 21.3C1200 21 1320 27 1380 29.3L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V0Z"
          fill="hsl(145 63% 32%)"
        />
      </svg>
    </div> -->

    <div class="container footer__inner">
      <div class="footer__grid">

        <!-- Brand -->
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="/images/logo.png" alt="Lumina TCF" class="footer__logo-img" />
          </div>
          <p class="footer__brand-desc">
            Votre plateforme de préparation au TCF Canada. Simulations en conditions
            réelles, correction IA et suivi de progression personnalisé.
          </p>

          <div class="footer__socials">
            <Button icon="pi pi-youtube"   rounded text class="footer__social-btn" aria-label="YouTube" />
            <Button icon="pi pi-whatsapp"  rounded text class="footer__social-btn" aria-label="WhatsApp" />
            <Button icon="pi pi-instagram" rounded text class="footer__social-btn" aria-label="Instagram" />
            <Button icon="pi pi-facebook"  rounded text class="footer__social-btn" aria-label="Facebook" />
          </div>

          <!-- Newsletter -->
          <div class="footer__newsletter">
            <p class="footer__newsletter-label">Restez informé</p>
            <div class="footer__newsletter-form">
              <InputText placeholder="Votre email" class="footer__newsletter-input" />
              <Button icon="pi pi-arrow-right" class="footer__newsletter-btn" aria-label="S'abonner" />
            </div>
          </div>
        </div>


        <!-- Ressources -->
        <div class="footer__col">
          <h3 class="footer__col-title">
            <i class="pi pi-compass" />
            Ressources
          </h3>
          <ul class="footer__links">
            <li v-for="link in ressourcesLinks" :key="link.to">
              <NuxtLink :to="link.to" class="footer__link">
                <i class="pi pi-angle-right footer__link-arrow" />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- À propos -->
        <div class="footer__col">
          <h3 class="footer__col-title">
            <i class="pi pi-info-circle" />
            À propos
          </h3>
          <ul class="footer__links">
            <li v-for="link in aproposLinks" :key="link.to">
              <NuxtLink :to="link.to" class="footer__link">
                <i class="pi pi-angle-right footer__link-arrow" />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

      </div>

      <Divider class="footer__divider" />

      <!-- Bottom -->
      <div class="footer__bottom">
        <span class="footer__copyright">
          © {{ new Date().getFullYear() }} <strong>Lumina TCF</strong> — ITIA SARL. Tous droits réservés.
        </span>
        <div class="footer__badges">
          <Tag value="Version 2026"     class="footer__badge" />
          <Tag value="Correction IA"    class="footer__badge" />
          <div class="footer__secure">
            <i class="pi pi-shield" />
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>

const ressourcesLinks = [
  { to: '/politique-confidentialite', label: 'Confidentialité' },
]

const aproposLinks = [
  { to: '/tarifs',     label: 'Tarifs'         },
  { to: '/contact',    label: 'Contact'        },
]
</script>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────── */
.footer {
  position: relative;
  background: var(--gradient-primary);
  color: #ffffff;
}

/* ── Wave ──────────────────────────────────────────────────── */
.footer__wave {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  line-height: 0;
}

.footer__wave svg {
  width: 100%;
  display: block;
}

/* ── Inner ─────────────────────────────────────────────────── */
.footer__inner {
  padding-top: 3.5rem;
  padding-bottom: 2rem;
}

/* ── Grid ──────────────────────────────────────────────────── */
.footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem 3rem;
}

@media (max-width: 1024px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
  }
  .footer__brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 480px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
}

/* ── Brand ─────────────────────────────────────────────────── */
.footer__logo-img {
  height: 40px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.footer__brand-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.7;
  margin: 0 0 1.25rem;
  max-width: 340px;
}

.footer__socials {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}

.footer__social-btn {
  color: #ffffff !important;
}

.footer__social-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* ── Newsletter ────────────────────────────────────────────── */
.footer__newsletter-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.625rem;
}

.footer__newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.footer__newsletter-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.footer__newsletter-input::placeholder {
  color: rgba(153, 246, 228, 0.6);
}

.footer__newsletter-btn {
  background: var(--color-secondary-400) !important;
  border: none !important;
  color: #0f172a !important;
  flex-shrink: 0;
}

.footer__newsletter-btn:hover {
  background: var(--color-secondary-500) !important;
}

/* ── Colonnes ──────────────────────────────────────────────── */
.footer__col-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
}

.footer__col-title i {
  color: var(--color-secondary-400);
  font-size: 0.9375rem;
}

.footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.footer__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer__link:hover {
  color: #ffffff;
}

.footer__link-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.footer__link:hover .footer__link-arrow {
  transform: translateX(3px);
}

/* ── Divider ───────────────────────────────────────────────── */
.footer__divider {
  border-color: rgba(255, 255, 255, 0.2) !important;
  margin: 2rem 0 !important;
}

/* ── Bottom ────────────────────────────────────────────────── */
.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer__copyright {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.footer__badges {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.footer__badge {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.footer__secure {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.footer__secure i {
  color: var(--color-secondary-400);
}
</style>