<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string;
    label: string;
    icon?: string;
    iconPos?: "left" | "right";
    external?: boolean;
    variant?: "gradient" | "light" | "outline" | "glass";
    size?: "md" | "lg";
  }>(),
  {
    iconPos: "right",
    external: false,
    variant: "gradient",
    size: "lg",
  }
);

const NuxtLink = resolveComponent("NuxtLink");

const variantClass = computed(() => {
  switch (props.variant) {
    case "light":
      return "bg-white text-primary-900 shadow-lift hover:bg-primary-50";
    case "outline":
      return "border border-line bg-card text-ink shadow-soft hover:border-primary hover:text-primary";
    case "glass":
      return "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:border-white/50";
    default:
      return "brand-gradient text-white shadow-brand hover:brightness-110 hover:shadow-brand-hover";
  }
});

const sizeClass = computed(() =>
  props.size === "md" ? "h-11 px-5 text-sm" : "h-14 px-7 text-cta"
);
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :external="to ? external : undefined"
    :type="to ? undefined : 'button'"
    class="inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap font-semibold rounded-leaf
           transition-all duration-200 ease-spring active:scale-[0.97]
           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="[variantClass, sizeClass]"
  >
    <i v-if="icon && iconPos === 'left'" :class="icon" />
    <span>{{ label }}</span>
    <i v-if="icon && iconPos === 'right'" :class="icon" />
  </component>
</template>