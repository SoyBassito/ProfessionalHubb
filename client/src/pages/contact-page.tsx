import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const handleWhatsAppClick = () => {
    const phone = "5493517705037";
    const message = encodeURIComponent("Hola! Me comunico desde APRESS para consultar sobre...");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Contacto</h1>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-0 h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d435.1901476772754!2d-64.79085250000002!3d-30.744592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942dc3943648c4e9%3A0x702c5253c7091833!2sMUNICIPALIDAD%20DE%20CRUZ%20DEL%20EJE!5e0!3m2!1ses!2sar!4v1710040336244!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la Municipalidad de Cruz del Eje"
                className="rounded-lg"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">¿Necesitas ayuda?</h2>
                  <p className="text-muted-foreground">
                    Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Información de contacto:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Email: info@apress.com.ar</li>
                    <li>• Teléfono: (+54) 3549 420000</li>
                    <li>• Horario de atención: Lunes a Viernes de 08:00 a 13:00</li>
                    <li>• Ubicación: Felix Cáceres esq. Arturo Illia, Cruz del Eje, Córdoba</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-[#128C7E] hover:bg-[#128C7E]/90"
                  >
                    <img src="/whatsappicon.png" alt="WhatsApp" className="w-4 h-4 mr-2" />
                    Contactar por WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}