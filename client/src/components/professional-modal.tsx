import { Professional, Rating } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RatingForm from "./rating-form";
import RatingsDisplay from "./ratings-display";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalModalProps {
  professional: Professional | null;
  onClose: () => void;
}

export default function ProfessionalModal({
  professional,
  onClose,
}: ProfessionalModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Obtener la configuración del sistema
  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  const { data: ratings = [] } = useQuery<Rating[]>({
    queryKey: [`/api/professionals/${professional?.id}/ratings`],
    enabled: !!professional && !!systemSettings?.showRatings,
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const res = await apiRequest(
        "POST",
        `/api/professionals/${professional?.id}/rate`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/professionals/${professional?.id}/ratings`],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/professionals"],
      });
      toast({
        title: "Calificación enviada",
        description: "Gracias por compartir tu experiencia",
      });
    },
  });

  const formatWhatsAppNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.startsWith('549') ? `+${cleaned}` : `+549${cleaned}`;
  };

  const handleWhatsAppClick = () => {
    if (professional) {
      const formattedNumber = formatWhatsAppNumber(professional.whatsapp);
      const message = encodeURIComponent("Hola! Me comunico contigo a través de APRESS para...");
      window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
    }
  };

  // Add a function to handle sharing
  const handleShare = async () => {
    if (professional && navigator.share) {
      try {
        const shareUrl = `${window.location.origin}/?professional=${professional.id}`;
        await navigator.share({
          title: professional.name,
          text: `${professional.name} - ${professional.occupation}\n${professional.description}`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={!!professional} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto backdrop-blur-sm bg-background/80">
        {professional && (
          <>
            <DialogHeader>
              <DialogTitle>{professional.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="aspect-square mb-4 w-full max-w-md mx-auto">
                <img
                  src={professional.photoUrl}
                  alt={professional.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {professional.occupation}
              </h3>
              <p className="text-muted-foreground mb-6">
                {professional.detailedDescription}
              </p>

              {systemSettings?.showRatings && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Calificaciones y Reseñas</h4>
                  <RatingsDisplay
                    ratings={ratings}
                    averageRating={professional.averageRating ?? undefined}
                    totalRatings={professional.totalRatings ?? undefined}
                  />
                </div>
              )}

              <div className="space-y-4">
                {user && systemSettings?.allowRatings && (
                  <RatingForm
                    professionalId={professional.id}
                    onSubmit={(data) => ratingMutation.mutate(data)}
                    isSubmitting={ratingMutation.isPending}
                  />
                )}

                <Button 
                  onClick={handleWhatsAppClick} 
                  className="w-full bg-[#128C7E] hover:bg-[#128C7E]/90"
                >
                  <img src="/whatsappicon.png" alt="WhatsApp" className="w-4 h-4 mr-1" />
                  Contactar por WhatsApp
                </Button>
                <Button 
                  onClick={handleShare} 
                  className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  Compartir
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}