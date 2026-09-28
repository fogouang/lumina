export interface NavItem {
  label: string;
  to: string;
  icon: string;
  exact?: boolean;
  badge?: string | number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}