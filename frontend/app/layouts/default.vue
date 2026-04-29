<template>
  <div class="layout">
    <LandingTopBar />
    <LandingNavBar />
    <main class="layout__main">
      <slot />
    </main>
    <LandingFooter />
    <AuthModal />
    <Toast />
  </div>
</template>

<style>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout__main {
  flex: 1;
}
</style>
