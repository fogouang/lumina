export interface LegalSection {
  title: string;
  intro?: string;
  items?: string[];
  subs?: { title: string; items: string[] }[];
  warning?: string;
  outro?: string;
}