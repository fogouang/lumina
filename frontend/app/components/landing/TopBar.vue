<template>
  <div class="topbar">
    <div class="topbar__left">
      <i class="pi pi-graduation-cap" />
      <span class="topbar__text"
        >Préparez-vous au TCF Canada avec la plateforme Lumina</span
      >
    </div>
    <div class="topbar__right">
      <NuxtLink to="/tarifs" class="topbar__link">
        <i class="pi pi-tag" />
        Tarifs
      </NuxtLink>
      <span class="topbar__divider">|</span>
      <NuxtLink to="/contact" class="topbar__link">
        <i class="pi pi-envelope" />
        Contact
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  background: var(--color-primary-700);
  color: #ffffff;
  padding: 0.625rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.topbar__left .pi {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.topbar__text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-shrink: 0;
}

.topbar__link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 600;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.topbar__link:hover {
  opacity: 1;
}

.topbar__link .pi {
  font-size: 0.875rem;
}

.topbar__divider {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .topbar__text {
    display: none;
  }
  .topbar__left .pi {
    display: none;
  }
}
</style>
