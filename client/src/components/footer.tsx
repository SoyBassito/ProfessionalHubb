import { Link } from "wouter";
import { Facebook, Instagram, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-white">
      {/* Barra de colores */}
      <div className="flex w-full">
        <div className="h-2 flex-1 bg-[#FF6B00]"></div>
        <div className="h-2 flex-1 bg-[#FFD600]"></div>
        <div className="h-2 flex-1 bg-[#800080]"></div>
        <div className="h-2 flex-1 bg-[#000080]"></div>
        <div className="h-2 flex-1 bg-[#87CEEB]"></div>
        <div className="h-2 flex-1 bg-white"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center justify-items-center">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/blancohorizontal.png"
              alt="Logo APRESS"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Teléfono */}
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 font-semibold text-lg">
              <Phone className="h-6 w-6 text-[#FF6B00]" /> 3549-420000
            </p>
          </div>

          {/* Dirección y correo */}
          <div className="flex gap-2">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-lg">
                Felix Cáceres XXX, Cruz del Eje, Cba.
              </p>
              <p className="font-semibold text-lg -mt-1">
                consultas@apress.com.ar
              </p>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="flex gap-8 justify-center">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B00] transition-colors">
              <Facebook className="h-6 w-6 font-bold" strokeWidth={2.5} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B00] transition-colors">
              <Instagram className="h-6 w-6 font-bold" strokeWidth={2.5} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-600">
          <p className="text-center text-gray-300 font-semibold">
            APRESS 2025 © Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}