"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useMyAccessibleSeries, useSeriesList } from "@/hooks/queries/useSeriesQueries";
import SeriesCard from "@/components/student/SeriesCard";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { ROUTES } from "@/lib/constants";

const FREE_SERIES = [100, 148, 149]; 

export default function SeriesListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  const { data: series, isLoading, error, refetch } = useSeriesList();
  const { data: accessData } = useMyAccessibleSeries(); 

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des séries..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les séries"
        retry={() => refetch()}
      />
    );
  }

  const hasPremiumAccess = accessData?.has_premium_access || false;

  // Fonction pour vérifier si une série est verrouillée
  const isSeriesLocked = (seriesNumber: number) => {
    return !FREE_SERIES.includes(seriesNumber) && !hasPremiumAccess;
  };

  // Gestion du clic sur une série
  const handleSeriesClick = (seriesId: string, seriesNumber: number) => {
    if (isSeriesLocked(seriesNumber)) {
     
      router.push(ROUTES.STUDENT_SUBSCRIPTION);
    } else {
      
      router.push(ROUTES.STUDENT_SERIES_DETAIL(seriesId));
    }
  };

  const filteredSeries =
    series?.filter((s) => {
      const titleForSearch = s.title ?? "";
      const matchesSearch = titleForSearch
        .toLowerCase()
        .includes(search.toLowerCase());
      return s.is_active && matchesSearch;
    }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Séries d'examen"
        description="Choisissez une série pour commencer votre préparation"
      />

      <SearchBar placeholder="Rechercher une série..." onSearch={setSearch} />

      {filteredSeries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucune série disponible"
          description={
            search
              ? "Aucune série ne correspond à votre recherche"
              : "Les séries d'examen apparaîtront ici lorsqu'elles seront publiées"
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeries.map((serie) => (
            <SeriesCard
              key={serie.id}
              series={serie}
              isLocked={isSeriesLocked(serie.number)}
              onSelect={() => handleSeriesClick(serie.id, serie.number)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}