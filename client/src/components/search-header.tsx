import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Settings, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedOccupation: string;
  onOccupationChange: (value: string) => void;
  occupations: string[];
}

export default function SearchHeader({
  searchTerm,
  onSearchChange,
  selectedOccupation,
  onOccupationChange,
  occupations,
}: SearchHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOccupationSelect = (occupation: string) => {
    onOccupationChange(occupation);
    setIsDialogOpen(false);
  };

  return (
    <header 
      className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-hero.jpg")' }}
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-white mb-8">
          ¿Qué estás buscando?
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Label htmlFor="search" className="sr-only">
              Buscar profesional
            </Label>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-full flex items-center h-16">
              <Search className="absolute left-6 h-6 w-6 text-muted-foreground pointer-events-none" />
              <input
                id="search"
                type="text"
                placeholder="Buscar a profesional"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-full bg-transparent text-lg px-16 focus:outline-none placeholder:text-muted-foreground"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div className="absolute right-6 cursor-pointer">
                    <Settings className="h-6 w-6 text-muted-foreground hover:opacity-80 transition-opacity" />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] p-6 rounded-lg border shadow-lg" hideCloseButton>
                  <div className="space-y-2">
                    <div
                      className={`px-4 py-2 rounded-md cursor-pointer hover:bg-accent/50 ${
                        selectedOccupation === "all" ? "font-bold" : ""
                      }`}
                      onClick={() => handleOccupationSelect("all")}
                    >
                      Todas las categorías
                    </div>
                    {occupations.map((occupation) => (
                      <div
                        key={occupation}
                        className={`px-4 py-2 rounded-md cursor-pointer hover:bg-accent/50 ${
                          selectedOccupation === occupation ? "font-bold" : ""
                        }`}
                        onClick={() => handleOccupationSelect(occupation)}
                      >
                        {occupation}
                      </div>
                    ))}
                  </div>
                  {/* Botón circular para cerrar */}
                  <Button
                    className="absolute left-1/2 -bottom-12 -translate-x-1/2 h-10 w-10 rounded-full bg-background border shadow-md hover:bg-accent flex items-center justify-center"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}