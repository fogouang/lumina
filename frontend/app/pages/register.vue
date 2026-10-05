<template>
  <div class="flex justify-center px-4 pt-28 pb-16 sm:px-6 lg:pt-32">
    <div
      class="w-full max-w-lg rounded-card border border-line bg-card p-6 shadow-soft sm:p-8"
    >
      <h1 class="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Créer un compte
      </h1>
      <p class="mt-2 mb-8 text-sm leading-relaxed text-muted">
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