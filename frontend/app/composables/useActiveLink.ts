import type { NavItem } from "~/types/navigation";

export const useActiveLink = () => {
  const route = useRoute();

  // Actif sur la page exacte, ou aussi sur ses sous-pages si exact n'est pas demandé
  function isActive(link: Pick<NavItem, "to" | "exact">) {
    if (link.exact) return route.path === link.to;
    return route.path === link.to || route.path.startsWith(link.to + "/");
  }

  return { isActive };
};