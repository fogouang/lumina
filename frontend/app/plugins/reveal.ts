type RevealFrom = "up" | "down" | "left" | "right" | "zoom";
type RevealValue = { from?: RevealFrom; delay?: number } | undefined;

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement & { _reveal?: IntersectionObserver }, RevealValue>("reveal", {
    getSSRProps(binding) {
      return {
        "data-reveal": binding.value?.from ?? "up",
        style: binding.value?.delay ? `--reveal-delay: ${binding.value.delay}ms` : undefined,
      };
    },

    mounted(el, binding) {
      el.dataset.reveal = binding.value?.from ?? "up";
      if (binding.value?.delay) {
        el.style.setProperty("--reveal-delay", `${binding.value.delay}ms`);
      }

      if (!("IntersectionObserver" in window)) {
        el.classList.add("is-visible");
        return;
      }

      const observer = new IntersectionObserver(
        ([entry], obs) => {
          if (entry?.isIntersecting) {
            el.classList.add("is-visible");
            obs.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      observer.observe(el);
      el._reveal = observer;
    },

    unmounted(el) {
      el._reveal?.disconnect();
    },
  });
});