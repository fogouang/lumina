<template>
  <div class="register-page">
    <div class="register-card">
      <NuxtLink to="/" class="register-card__logo">
        <img src="/images/logo.png" alt="Lumina TCF" />
      </NuxtLink>

      <h1 class="register-card__title">Créer un compte</h1>
      <p class="register-card__subtitle">
        Rejoignez des milliers de candidats qui préparent leur TCF Canada.
      </p>

      <AuthRegisterForm
        :referral-code="referralCode"
        :show-switch="true"
        @success="onSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { switchTab, openLogin } = useAuthModal();

const referralCookie = useCookie<string | null>("referral_code", {
  maxAge: 60 * 60 * 24 * 30,
});
const referralCode = computed(() => referralCookie.value);

onMounted(() => {
  const ref = route.query.ref as string | undefined;
  if (ref) referralCookie.value = ref;
});

const onSuccess = () => {
  referralCookie.value = null;
  navigateTo("/mon-compte");
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-ground);
}

.register-card {
  width: 100%;
  max-width: 460px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 2rem;
}

.register-card__logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.register-card__logo img {
  height: 40px;
  object-fit: contain;
}

.register-card__title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 0.375rem;
}

.register-card__subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
</style>