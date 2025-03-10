import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProfessionalSchema, insertUserSchema, insertRatingSchema, insertCategorySchema } from "@shared/schema";
import { ZodError } from "zod";

function requireAdmin(req: Request) {
  if (!req.isAuthenticated()) {
    throw new Error("Unauthorized");
  }
  if (!req.user.isAdmin && !req.user.isSuperAdmin) {
    throw new Error("Forbidden");
  }
}

function requireSuperAdmin(req: Request) {
  if (!req.isAuthenticated()) {
    throw new Error("Unauthorized");
  }
  if (!req.user.isSuperAdmin) {
    throw new Error("Forbidden");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Rutas de profesionales existentes
  app.get("/api/professionals", async (_req, res) => {
    const professionals = await storage.getProfessionals();
    res.json(professionals);
  });

  app.get("/api/professionals/:id", async (req, res) => {
    const professional = await storage.getProfessional(Number(req.params.id));
    if (!professional) {
      return res.status(404).send("Professional not found");
    }
    res.json(professional);
  });

  app.post("/api/professionals", async (req, res) => {
    try {
      requireAdmin(req);
      const professional = insertProfessionalSchema.parse(req.body);
      const created = await storage.createProfessional(professional);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json(e.errors);
      }
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.patch("/api/professionals/:id", async (req, res) => {
    try {
      requireAdmin(req);
      const professional = await storage.updateProfessional(
        Number(req.params.id),
        req.body
      );
      if (!professional) {
        return res.status(404).send("Professional not found");
      }
      res.json(professional);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/professionals/:id", async (req, res) => {
    try {
      requireSuperAdmin(req);  // Solo superadmin puede eliminar
      const success = await storage.deleteProfessional(Number(req.params.id));
      if (!success) {
        return res.status(404).send("Professional not found");
      }
      res.sendStatus(204);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  // Rutas para categorías
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).send("Category not found");
      }
      res.json(category);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getSubcategories(Number(req.params.id));
      res.json(subcategories);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      requireAdmin(req);
      const category = insertCategorySchema.parse(req.body);
      const created = await storage.createCategory(category);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json(e.errors);
      }
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      requireAdmin(req);
      const category = await storage.updateCategory(Number(req.params.id), req.body);
      if (!category) {
        return res.status(404).send("Category not found");
      }
      res.json(category);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const success = await storage.deleteCategory(Number(req.params.id));
      if (!success) {
        return res.status(404).send("Category not found");
      }
      res.sendStatus(204);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  // Rutas para asignación de categorías a profesionales
  app.post("/api/professionals/:professionalId/categories/:categoryId", async (req, res) => {
    try {
      requireAdmin(req);
      const assignment = await storage.assignProfessionalToCategory(
        Number(req.params.professionalId),
        Number(req.params.categoryId)
      );
      res.status(201).json(assignment);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/professionals/:professionalId/categories/:categoryId", async (req, res) => {
    try {
      requireAdmin(req);
      const success = await storage.removeProfessionalFromCategory(
        Number(req.params.professionalId),
        Number(req.params.categoryId)
      );
      if (!success) {
        return res.status(404).send("Assignment not found");
      }
      res.sendStatus(204);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/categories/:categoryId/professionals", async (req, res) => {
    try {
      const professionals = await storage.getProfessionalsByCategory(Number(req.params.categoryId));
      res.json(professionals);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/professionals/:professionalId/categories", async (req, res) => {
    try {
      const categories = await storage.getCategoriesByProfessional(Number(req.params.professionalId));
      res.json(categories);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });


  // Rutas de gestión de usuarios
  app.get("/api/users", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const users = await storage.getUsers();
      res.json(users);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const { username, password, role } = req.body;
      const userData = insertUserSchema.parse({ username, password });

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUserWithRole(
        userData,
        role === "admin" || role === "superadmin",
        role === "superadmin"
      );
      res.status(201).json(user);
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json(e.errors);
      }
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.patch("/api/users/:id/role", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const userId = Number(req.params.id);
      const { role } = req.body;

      if (userId === req.user!.id) {
        return res.status(400).send("Cannot modify your own role");
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.json(updatedUser);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const userId = Number(req.params.id);

      if (userId === req.user!.id) {
        return res.status(400).send("No puedes eliminar tu propia cuenta");
      }

      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).send("Usuario no encontrado");
      }

      res.sendStatus(204);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const userId = Number(req.params.id);

      // No permitir que un usuario se edite a sí mismo
      if (userId === req.user!.id) {
        return res.status(400).send("No puedes modificar tu propia cuenta");
      }

      const user = await storage.updateUser(userId, req.body);
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      res.json(user);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  // Rutas para ratings
  app.post("/api/professionals/:id/rate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }

      const rating = insertRatingSchema.parse({
        ...req.body,
        professionalId: Number(req.params.id),
      });

      const newRating = await storage.addRating(req.user!.id, rating);

      // Actualizar recomendaciones después de una nueva calificación
      await storage.updateRecommendations(req.user!.id);

      res.status(201).json(newRating);
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json(e.errors);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/professionals/:id/ratings", async (req, res) => {
    try {
      const ratings = await storage.getProfessionalRatings(Number(req.params.id));
      res.json(ratings);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }

      const recommendations = await storage.getRecommendations(req.user!.id);
      res.json(recommendations);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  // Rutas para la configuración del sistema
  app.get("/api/system-settings", async (_req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  app.patch("/api/system-settings", async (req, res) => {
    try {
      requireSuperAdmin(req);
      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (e) {
      if (e instanceof Error) {
        return res.status(403).send(e.message);
      }
      res.status(500).send("Internal Server Error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}