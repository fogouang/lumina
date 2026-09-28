import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

const roles = {
  text: {
    color: "var(--app-ink)",
    hoverColor: "var(--app-ink)",
    mutedColor: "var(--app-muted)",
    hoverMutedColor: "var(--app-ink)",
  },
  content: {
    background: "var(--app-card)",
    hoverBackground: "var(--app-card-2)",
    borderColor: "var(--app-line)",
    color: "var(--app-ink)",
    hoverColor: "var(--app-ink)",
  },
  formField: {
    background: "var(--app-card)",
    filledBackground: "var(--app-card-2)",
    borderColor: "var(--app-line)",
    color: "var(--app-ink)",
    placeholderColor: "var(--app-faint)",
  },
  overlay: {
    select: {
      background: "var(--app-card)",
      borderColor: "var(--app-line)",
      color: "var(--app-ink)",
    },
    popover: {
      background: "var(--app-card)",
      borderColor: "var(--app-line)",
      color: "var(--app-ink)",
    },
    modal: {
      background: "var(--app-card)",
      borderColor: "var(--app-line)",
      color: "var(--app-ink)",
    },
  },
};

const AppPreset = definePreset(Aura, {
  primitive: {
    brand: {
      50: "#f0f6fc",
      100: "#dce9f8",
      200: "#b9d2f0",
      300: "#8ab1e3",
      400: "#6394d6",
      500: "#3d76c6",
      600: "#285faf",
      700: "#20509b",
      800: "#12346e",
      900: "#08214e",
      950: "#041536",
    },
    accent: {
      50: "#fff9eb",
      100: "#fff1cc",
      200: "#ffe299",
      300: "#ffd05c",
      400: "#fdc035",
      500: "#f4ae17",
      600: "#d9940c",
      700: "#b97c0e", // estimé
      800: "#9a6510", // estimé
      900: "#7a4d12",
      950: "#4a2e0a", // estimé
    },
  },
  semantic: {
    primary: {
      50: "{brand.50}",
      100: "{brand.100}",
      200: "{brand.200}",
      300: "{brand.300}",
      400: "{brand.400}",
      500: "{brand.500}",
      600: "{brand.600}",
      700: "{brand.700}",
      800: "{brand.800}",
      900: "{brand.900}",
      950: "{brand.950}",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "{slate.50}",
          100: "{slate.100}",
          200: "{slate.200}",
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },
        primary: {
          color: "{primary.700}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.900}",
        },
        mask: {
          background: "rgba(8, 33, 78, 0.45)",
          color: "{surface.200}",
        },
        ...roles,
      },
      dark: {
        surface: {
          0: "#ffffff",
          50: "{slate.50}",
          100: "{slate.100}",
          200: "{slate.200}",
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },
        primary: {
          color: "{primary.400}",
          contrastColor: "{brand.950}",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
        mask: {
          background: "rgba(0, 0, 0, 0.6)",
          color: "{surface.200}",
        },
        ...roles,
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: "0.75rem",
        paddingX: "1.125rem",
        paddingY: "0.625rem",
        gap: "0.5rem",
        label: {
          fontWeight: "600",
        },
      },
    },
    dialog: {
      root: {
        borderRadius: "1.25rem",
        shadow: "var(--app-shadow-lift)",
      },
      header: {
        padding: "1.5rem 1.5rem 0.75rem 1.5rem",
        gap: "0.75rem",
      },
      content: {
        padding: "0.25rem 1.5rem 1.25rem 1.5rem",
      },
      footer: {
        padding: "1rem 1.5rem 1.5rem 1.5rem",
        gap: "0.5rem",
      },
    },
  },
});

export default {
  preset: AppPreset,
  options: {
    darkModeSelector: ".app-dark",
    cssLayer: {
      name: "primevue",
      order: "theme, base, primevue",
    },
  },
};