import { useQuery, useMutation } from "@tanstack/react-query";
import { Professional, insertProfessionalSchema, User, insertUserSchema } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as z from 'zod';
import { useState, useEffect } from "react";
import CategoryForm from "@/components/category-form";
import {Category, InsertCategory} from "@shared/schema";
import { Switch } from "@/components/ui/switch";

interface SystemSettings {
  showRatings: boolean;
  allowRatings: boolean;
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}

function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="default" onClick={onConfirm}>
            Confirmar
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [professionalSearch, setProfessionalSearch] = useState(""); // Added state
  const professionalForm = useForm({
    resolver: zodResolver(insertProfessionalSchema.extend({
      whatsapp: z.string().refine((val) => {
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 13;
      }, "El número debe tener entre 10 y 13 dígitos"),
      categoryId: z.number().nullable(),
    })),
    defaultValues: {
      name: "",
      occupation: "",
      description: "",
      photoUrl: "",
      whatsapp: "",
      detailedDescription: "",
      categoryId: null,
    },
  });

  const userForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
    },
  });

  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.isSuperAdmin,
  });

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: Professional) => {
      const res = await apiRequest("POST", "/api/professionals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      professionalForm.reset();
      toast({
        title: "Éxito",
        description: "Profesional agregado correctamente",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      userForm.reset();
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/professionals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Éxito",
        description: "Profesional eliminado correctamente",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Éxito",
        description: "Rol de usuario actualizado correctamente",
      });
    },
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; user: Partial<User> }) => {
      const res = await apiRequest("PATCH", `/api/users/${data.id}`, data.user);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      userForm.reset();
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      });
    },
  });

  const handleUserSubmit = (formData: any) => {
    const role = formData.role;
    delete formData.role;

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        user: { ...formData },
      });
    } else {
      createUserMutation.mutate({ ...formData, role });
    }
  };


  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      });
    },
  });

  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  const updateProfessionalMutation = useMutation({
    mutationFn: async (data: { id: number; professional: Partial<Professional> }) => {
      const res = await apiRequest("PATCH", `/api/professionals/${data.id}`, data.professional);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      setEditingProfessional(null);
      professionalForm.reset();
      toast({
        title: "Éxito",
        description: "Profesional actualizado correctamente",
      });
    },
  });

  const handleProfessionalSubmit = (data: Professional) => {
    if (editingProfessional) {
      updateProfessionalMutation.mutate({ id: editingProfessional.id, professional: data });
    } else {
      createProfessionalMutation.mutate(data);
    }
  };

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente",
      });
    },
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { id: number; category: Partial<Category> }) => {
      const res = await apiRequest("PATCH", `/api/categories/${data.id}`, data.category);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingCategory(null);
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
      });
    },
  });

  const handleCategorySubmit = (data: InsertCategory) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, category: data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // New hooks for system settings
  const { data: systemSettings, isLoading: isLoadingSettings } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
    enabled: user?.isSuperAdmin,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SystemSettings>) => {
      const res = await apiRequest("PATCH", "/api/system-settings", {
        ...systemSettings,  // Mantener los valores existentes
        ...settings,       // Aplicar los nuevos valores
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente",
      });
    },
  });

  // Estados locales para los switches
  const [localShowRatings, setLocalShowRatings] = useState(systemSettings?.showRatings);
  const [localAllowRatings, setLocalAllowRatings] = useState(systemSettings?.allowRatings);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Efecto para sincronizar estados locales cuando cambian los settings
  useEffect(() => {
    setLocalShowRatings(systemSettings?.showRatings);
    setLocalAllowRatings(systemSettings?.allowRatings);
  }, [systemSettings]);

  const handleSettingChange = (setting: 'showRatings' | 'allowRatings', checked: boolean) => {
    const messages = {
      showRatings: {
        title: checked ? 'Activar visualización de calificaciones' : 'Desactivar visualización de calificaciones',
        description: checked
          ? '¿Quieres mostrar las calificaciones en los perfiles de profesionales?'
          : '¿Quieres ocultar las calificaciones de los perfiles de profesionales?'
      },
      allowRatings: {
        title: checked ? 'Activar sistema de calificaciones' : 'Desactivar sistema de calificaciones',
        description: checked
          ? '¿Quieres permitir que los usuarios califiquen a los profesionales?'
          : '¿Quieres deshabilitar la posibilidad de calificar?'
      }
    };

    // Actualizar estado local temporalmente
    if (setting === 'showRatings') {
      setLocalShowRatings(checked);
    } else {
      setLocalAllowRatings(checked);
    }

    setConfirmDialog({
      open: true,
      title: messages[setting].title,
      description: messages[setting].description,
      onConfirm: () => {
        updateSettingsMutation.mutate({
          [setting]: checked,
          [setting === 'showRatings' ? 'allowRatings' : 'showRatings']:
            systemSettings?.[setting === 'showRatings' ? 'allowRatings' : 'showRatings'],
        });
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  };


  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>

        <Tabs defaultValue="professionals">
          <TabsList className="w-full mb-8">
            <TabsTrigger value="professionals" className="flex-1">
              Profesionales
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              Categorías
            </TabsTrigger>
            {user?.isSuperAdmin && (
              <>
                <TabsTrigger value="users" className="flex-1">
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  Configuración del Sistema
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="professionals">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Agregar Profesional</h2>
                  <Form {...professionalForm}>
                    <form
                      onSubmit={professionalForm.handleSubmit(handleProfessionalSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={professionalForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ocupación</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción Corta</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="photoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Foto del Profesional</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      field.onChange(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de WhatsApp</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ejemplo: 549XXXXXXXXXX"
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="detailedDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción Detallada</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría Principal</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                              value={field.value?.toString() || "null"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="null">Ninguna</SelectItem>
                                {categories?.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createProfessionalMutation.isPending || updateProfessionalMutation.isPending}
                      >
                        {editingProfessional ? "Actualizar Profesional" : "Agregar Profesional"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Gestionar Profesionales</h2>
                  <div className="w-64">
                    <Input
                      type="search"
                      placeholder="Buscar profesional..."
                      onChange={(e) => {
                        const searchQuery = e.target.value.toLowerCase();
                        setProfessionalSearch(searchQuery);
                      }}
                    />
                  </div>
                </div>
                {isLoadingProfessionals ? (
                  <div>Cargando...</div>
                ) : (
                  professionals
                    ?.filter((professional) =>
                      professional.name.toLowerCase().includes(professionalSearch) ||
                      professional.occupation.toLowerCase().includes(professionalSearch)
                    )
                    .map((professional) => (
                      <Card key={professional.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{professional.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {professional.occupation}
                              </p>
                            </div>
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  professionalForm.reset(professional);
                                  setEditingProfessional(professional);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {user?.isSuperAdmin && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => deleteMutation.mutate(professional.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingCategory ? "Editar Categoría" : "Crear Categoría"}
                  </CardTitle>
                  <CardDescription>
                    {editingCategory
                      ? "Modifica los detalles de la categoría"
                      : "Añade una nueva categoría al directorio"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryForm
                    onSubmit={handleCategorySubmit}
                    categories={categories || []}
                    defaultValues={editingCategory || undefined}
                    isSubmitting={
                      createCategoryMutation.isPending ||
                      updateCategoryMutation.isPending
                    }
                    submitLabel={
                      editingCategory ? "Actualizar Categoría" : "Crear Categoría"
                    }
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestionar Categorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCategories ? (
                      <div>Cargando categorías...</div>
                    ) : (
                      <div className="space-y-4">
                        {categories?.map((category) => (
                          <Card key={category.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{category.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {category.description}
                                  </p>
                                </div>
                                <div className="space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setEditingCategory(category)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  {user?.isSuperAdmin && (
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        setConfirmDialog({
                                          open: true,
                                          title: "¿Estás seguro de que quieres eliminar esta categoría?",
                                          description: "Esta acción no se puede deshacer.",
                                          onConfirm: () => deleteCategoryMutation.mutate(category.id),
                                        });
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {user?.isSuperAdmin && (
            <TabsContent value="users">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Crear Usuario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form
                        onSubmit={userForm.handleSubmit(handleUserSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={userForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de Usuario</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rol</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuario Normal</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="superadmin">Super Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={createUserMutation.isPending || updateUserMutation.isPending}
                        >
                          {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestionar Usuarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div>Cargando usuarios...</div>
                    ) : (
                      <div className="space-y-4">
                        {users?.map((u) => (
                          <Card key={u.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{u.username}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {u.isSuperAdmin
                                      ? "Super Administrador"
                                      : u.isAdmin
                                        ? "Administrador"
                                        : "Usuario Normal"}
                                  </p>
                                </div>
                                {u.id !== user.id && (
                                  <div className="flex gap-2">
                                    <Select
                                      defaultValue={
                                        u.isSuperAdmin
                                          ? "superadmin"
                                          : u.isAdmin
                                            ? "admin"
                                            : "user"
                                      }
                                      onValueChange={(value) =>
                                        updateUserRoleMutation.mutate({
                                          userId: u.id,
                                          role: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Seleccionar rol" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">Usuario Normal</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="superadmin">Super Administrador</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        userForm.reset(u);
                                        setEditingUser(u);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        setConfirmDialog({
                                          open: true,
                                          title: "¿Estás seguro de que quieres eliminar este usuario?",
                                          description: "Esta acción no se puede deshacer.",
                                          onConfirm: () => deleteUserMutation.mutate(u.id),
                                        });
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración del Sistema
                </CardTitle>
                <CardDescription>
                  Gestiona las características y funcionalidades del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSettings ? (
                  <div>Cargando configuración...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Mostrar Calificaciones</h4>
                        <p className="text-sm text-muted-foreground">
                          Mostrar las calificaciones y reseñas en los perfiles de profesionales
                        </p>
                      </div>
                      <Switch
                        checked={localShowRatings}
                        onCheckedChange={(checked) => handleSettingChange('showRatings', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Permitir Calificaciones</h4>
                        <p className="text-sm text-muted-foreground">
                          Permitir que los usuarios califiquen y dejen reseñas
                        </p>
                      </div>
                      <Switch
                        checked={localAllowRatings}
                        onCheckedChange={(checked) => handleSettingChange('allowRatings', checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          setConfirmDialog(prev => ({ ...prev, open }));
          if (!open) {
            // Revertir estados locales si se cierra sin confirmar
            setLocalShowRatings(systemSettings?.showRatings ?? false);
            setLocalAllowRatings(systemSettings?.allowRatings ?? false);
          }
        }}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}