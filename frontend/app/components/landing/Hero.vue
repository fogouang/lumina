<template>
  <section class="relative overflow-hidden">
    <!-- Image de fond -->
    <div class="absolute inset-0 -z-10">
      <img
        src="/images/hero.jpg"
        alt=""
        class="h-full w-full object-cover object-[center_20%]"
      />
      <!-- Overlay sombre uniforme, simple -->
      <div class="absolute inset-0 bg-black/60" />
    </div>

    <div
  class="container relative mx-auto flex aspect-4/5 max-w-400 items-center py-16 sm:aspect-16/10 lg:aspect-auto lg:min-h-screen lg:py-24"
    >
      <div class="w-full max-w-md lg:max-w-lg">
        <!-- Titre -->
        <h1
          class="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[2.75rem] xl:text-5xl"
        >
          Ici, on ne passe pas le
          <span class="text-primary-400">TCF Canada</span>
          deux fois.
        </h1>

        <!-- Description -->
        <p
          class="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both mt-5 text-sm leading-relaxed text-white/80"
        >
          Simulations en conditions réelles, correction IA instantanée des
          expressions écrites, enregistrement et évaluation de vos expressions
          orales directement sur la plateforme, et suivi de progression
          personnalisé — tout ce qu’il faut pour obtenir votre score du premier
          coup, à moindre coût.
        </p>

        <!-- CTAs -->
        <div
          class="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <NuxtLink to="/tarifs">
            <Button
              label="Voir les prix"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="rounded-xl! bg-white! border-none! px-6! py-3.5! text-base! font-bold! text-primary-800! shadow-lg! transition-all hover:bg-primary-50! hover:shadow-xl! hover:-translate-y-0.5!"
            />
          </NuxtLink>
          <Button
            label="Pratiquer"
            icon="pi pi-sign-in"
            size="large"
            outlined
            class="rounded-xl! border-2! border-white/70! bg-transparent! px-6! py-3.5! text-base! font-semibold! text-white! transition-all hover:bg-white/10! hover:-translate-y-0.5!"
            @click="openLogin()"
          />
        </div>

        <!-- Stats -->
        <div
          class="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both mt-10 border-t border-white/20 pt-6"
        >
          <p
            class="text-xs font-semibold uppercase tracking-widest text-white/60"
          >
            Utilisé par des milliers de candidats
          </p>
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="flex flex-col gap-0.5">
              <span class="font-display text-2xl font-extrabold text-white"
                >3K+</span
              >
              <span class="text-sm text-white/65">Candidats</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-display text-2xl font-extrabold text-white"
                >4</span
              >
              <span class="text-sm text-white/65">Modules</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-display text-2xl font-extrabold text-white"
                >10K+</span
              >
              <span class="text-sm text-white/65">Tests réalisés</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { openLogin } = useAuthModal();
</script>
