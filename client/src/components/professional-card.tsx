import { Professional } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "./star-rating";
import { useQuery } from "@tanstack/react-query";

interface ProfessionalCardProps {
  professional: Professional;
  onViewMore: () => void;
}

export default function ProfessionalCard({
  professional,
  onViewMore,
}: ProfessionalCardProps) {
  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  const formatWhatsAppNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.startsWith('549') ? `+${cleaned}` : `+549${cleaned}`;
  };

  const handleWhatsAppClick = () => {
    const formattedNumber = formatWhatsAppNumber(professional.whatsapp);
    const message = encodeURIComponent("Hola! Me comunico contigo a través de APRESS para...");
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={professional.photoUrl}
          alt={professional.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold truncate">{professional.name}</h3>
          {systemSettings?.showRatings && (
            <StarRating
              rating={professional.averageRating}
              totalRatings={professional.totalRatings}
              showCount
              size="sm"
            />
          )}
        </div>
        <p className="text-sm font-medium text-primary mb-2">
          {professional.occupation}
        </p>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {professional.description}
        </p>
        <div className="flex gap-2">
          <Button onClick={onViewMore} variant="outline" className="flex-1">
            Ver más
          </Button>
          <Button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-[#128C7E] hover:bg-[#128C7E]/90"
          >
            <img src="/whatsappicon.png" alt="WhatsApp" className="w-4 h-4 mr-2" />
            Contactar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}