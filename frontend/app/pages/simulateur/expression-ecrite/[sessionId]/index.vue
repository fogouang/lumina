<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: "account", middleware: "auth" });

const route = useRoute();
await navigateTo(
  { path: "/simulateur/expression-ecrite", query: { session: route.params.sessionId as string } },
  { replace: true },
);
</script>