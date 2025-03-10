import { Card, CardContent } from "@/components/ui/card";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">¿Cómo funciona APRESS?</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">🔍 Búsqueda de Profesionales</h2>
              <img 
                src="/busqueda.png" 
                alt="Búsqueda de profesionales" 
                className="w-full rounded-lg mb-4"
              />
              <p className="text-muted-foreground">
                Utiliza la barra de búsqueda en la página principal para encontrar 
                profesionales por nombre o categoría. También puedes filtrar por 
                tipo de profesión usando el botón de configuración.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">💬 Contacto Directo</h2>
              <img 
                src="/contacto.png" 
                alt="Contacto por WhatsApp" 
                className="w-full rounded-lg mb-4"
              />
              <p className="text-muted-foreground">
                Al encontrar el profesional que necesitas, puedes contactarlo 
                directamente por WhatsApp. También puedes compartir su perfil 
                con otras personas que puedan necesitar sus servicios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">⭐ Calificaciones y Reseñas</h2>
              <img 
                src="/calificaciones.png" 
                alt="Sistema de calificaciones" 
                className="w-full rounded-lg mb-4"
              />
              <p className="text-muted-foreground">
                Los usuarios pueden calificar y dejar reseñas sobre los servicios 
                recibidos. Esto ayuda a otros usuarios a tomar mejores decisiones 
                basadas en experiencias reales.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">📱 Experiencia Móvil</h2>
              <img 
                src="/mobile.png" 
                alt="Vista en dispositivos móviles" 
                className="w-full rounded-lg mb-4"
              />
              <p className="text-muted-foreground">
                APRESS está diseñado para funcionar perfectamente en cualquier 
                dispositivo, permitiéndote encontrar y contactar profesionales 
                desde tu teléfono móvil o tablet.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">¿Eres un Profesional?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Si eres un profesional y quieres formar parte de nuestra red, 
            contáctanos. Nos encantaría tenerte en nuestra comunidad y 
            ayudarte a conectar con más clientes.
          </p>
        </div>
      </div>
    </div>
  );
}
