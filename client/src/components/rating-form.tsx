import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import * as z from "zod";

interface RatingFormProps {
  professionalId: number;
  onSubmit: (data: { rating: number; comment: string }) => void;
  isSubmitting?: boolean;
}

const ratingFormSchema = z.object({
  professionalId: z.number(),
  rating: z.number().min(1, "Debes seleccionar al menos una estrella").max(5),
  comment: z.string().min(1, "El comentario es obligatorio"),
});

export default function RatingForm({
  professionalId,
  onSubmit,
  isSubmitting,
}: RatingFormProps) {
  const form = useForm({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      professionalId,
      rating: 5,
      comment: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calificación</FormLabel>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={field.value >= value ? "default" : "outline"}
                    size="icon"
                    onClick={() => field.onChange(value)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comparte tu experiencia con este profesional..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Enviar Calificación
        </Button>
      </form>
    </Form>
  );
}