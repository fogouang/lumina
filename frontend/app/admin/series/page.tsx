import { Metadata } from "next";
import SeriesList from "@/components/admin/SeriesList";

export const metadata: Metadata = {
  title: "Séries | Admin TCF Canada",
  description: "Gérer les séries d'examens",
};

export default function AdminSeriesPage() {
  return <SeriesList />;
}