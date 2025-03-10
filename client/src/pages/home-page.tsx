import { useQuery } from "@tanstack/react-query";
import { Professional } from "@shared/schema";
import SearchHeader from "@/components/search-header";
import ProfessionalCard from "@/components/professional-card";
import ProfessionalCardSkeleton from "@/components/professional-card-skeleton";
import ProfessionalModal from "@/components/professional-modal";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: professionals, isLoading } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOccupation, setSelectedOccupation] = useState<string>("all");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [visibleCount, setVisibleCount] = useState(4); 
  const { user } = useAuth();

  // Add useEffect to check URL params
  useEffect(() => {
    if (!professionals) return;

    const params = new URLSearchParams(window.location.search);
    const professionalId = params.get('professional');

    if (professionalId) {
      const professional = professionals.find(p => p.id === parseInt(professionalId));
      if (professional) {
        setSelectedProfessional(professional);
      }
    }
  }, [professionals]);

  const occupations = Array.from(
    new Set(professionals?.map((p) => p.occupation) || [])
  );

  const filteredProfessionals = professionals?.filter((professional) => {
    const matchesSearch = professional.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesOccupation =
      selectedOccupation === "all" || professional.occupation === selectedOccupation;
    return matchesSearch && matchesOccupation;
  });

  // Resetear el contador cuando cambia el filtro
  useEffect(() => {
    setVisibleCount(4);
  }, [searchTerm, selectedOccupation]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  // Determinar cuántos profesionales mostrar basado en el viewport
  const visibleProfessionals = filteredProfessionals?.slice(0, visibleCount);
  const desktopProfessionals = filteredProfessionals?.slice(0, 16);
  const hasMore = filteredProfessionals && visibleCount < filteredProfessionals.length;

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedOccupation={selectedOccupation}
        onOccupationChange={setSelectedOccupation}
        occupations={occupations}
      />

      <main className="container mx-auto py-8 px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(16)].map((_, i) => (
              <ProfessionalCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Vista móvil */}
            <div className="md:hidden grid grid-cols-1 gap-6">
              {visibleProfessionals?.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onViewMore={() => setSelectedProfessional(professional)}
                />
              ))}
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleLoadMore}
                    variant="outline"
                    className="w-full max-w-xs"
                  >
                    Ver más profesionales
                  </Button>
                </div>
              )}
            </div>

            {/* Vista desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {desktopProfessionals?.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onViewMore={() => setSelectedProfessional(professional)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <ProfessionalModal
        professional={selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
      />
    </div>
  );
}