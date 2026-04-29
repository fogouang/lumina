<template>
  <div class="topbar">
    <span class="topbar__welcome">
      🎓 Bienvenue sur Lumina — Plateforme de préparation au TCF Canada
    </span>
    <nav class="topbar__links">
      <NuxtLink to="/formations">Formations</NuxtLink>
      <NuxtLink to="/tarifs">Tarifs</NuxtLink>
      <NuxtLink to="/blog">Blog</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.topbar {
  background: var(--color-primary-800);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8125rem;
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.topbar__welcome {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar__links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-shrink: 0;
}

.topbar__links a {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.topbar__links a:hover {
  color: #ffffff;
}

@media (max-width: 640px) {
  .topbar__welcome {
    display: none;
  }
}
</style>