import { Metadata } from "next";
import SessionsList from "@/components/admin/SessionsList";

export const metadata: Metadata = {
  title: "Séries | Admin TCF Canada",
  description: "Gérer les séries d'examens",
};

export default function AdminSessionPage() {
  return <SessionsList />;
}