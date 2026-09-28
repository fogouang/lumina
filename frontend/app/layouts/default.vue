<template>
  <div class="flex min-h-screen flex-col bg-canvas text-ink">
    <LandingNavBar />
    <main class="flex-1">
      <slot />
    </main>
    <LandingFooter />
    <AuthModal />
    <Toast />
  </div>
</template>