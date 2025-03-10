import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Power, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { useState } from "react";

export function NavBar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isAdminPage = location === "/admin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/bordohorizontall.png"
              alt="Logo APRESS"
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* Botón de menú móvil con animación */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden relative w-10 h-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className={`h-6 w-6 absolute transition-all duration-300 ${
              isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`} />
            <X className={`h-6 w-6 absolute transition-all duration-300 ${
              isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`} />
          </Button>

          {/* Enlaces de navegación para pantallas grandes */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/contacto" className="text-gray-700 hover:text-primary font-coheadline">Contacto</Link>
            <Link href="/informacion" className="text-gray-700 hover:text-primary font-coheadline">Información</Link>
            {user ? (
              <>
                <Link 
                  href={isAdminPage ? "/" : "/admin"} 
                  className="bg-[#FF6B00] text-white px-6 py-2 rounded-full hover:bg-[#FF6B00]/90 transition-colors font-coheadline"
                >
                  {isAdminPage ? "Volver al Directorio" : "Panel de Administración"}
                </Link>
                <Button 
                  onClick={() => logoutMutation.mutate()}
                  className="bg-red-600 text-white hover:bg-red-700 transition-colors rounded-full"
                  disabled={logoutMutation.isPending}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="bg-[#FF6B00] text-white px-6 py-2 rounded-full hover:bg-[#FF6B00]/90 transition-colors font-coheadline"
              >
                Acceder
              </Link>
            )}
          </div>
        </div>

        {/* Menú móvil con animación */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/contacto" 
                className="text-gray-700 hover:text-primary font-coheadline"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link 
                href="/informacion" 
                className="text-gray-700 hover:text-primary font-coheadline"
                onClick={() => setIsMenuOpen(false)}
              >
                Información
              </Link>
              {user ? (
                <>
                  <Link 
                    href={isAdminPage ? "/" : "/admin"} 
                    className="bg-[#FF6B00] text-white px-4 py-2 rounded-full hover:bg-[#FF6B00]/90 transition-colors text-center font-coheadline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {isAdminPage ? "Volver al Directorio" : "Panel de Administración"}
                  </Link>
                  <Button 
                    onClick={() => {
                      logoutMutation.mutate();
                      setIsMenuOpen(false);
                    }}
                    className="bg-red-600 text-white hover:bg-red-700 transition-colors w-full rounded-full"
                    disabled={logoutMutation.isPending}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="bg-[#FF6B00] text-white px-4 py-2 rounded-full hover:bg-[#FF6B00]/90 transition-colors text-center font-coheadline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Acceder
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}