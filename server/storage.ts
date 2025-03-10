import { Professional, InsertProfessional, User, InsertUser, users, professionals, ratings, recommendations, Rating, InsertRating, categories, professionalCategories, Category, InsertCategory, ProfessionalCategory, systemSettings, SystemSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, like } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { hashPassword } from "./auth";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithRole(user: InsertUser, isAdmin: boolean, isSuperAdmin: boolean): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;

  getProfessionals(): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, professional: Partial<InsertProfessional>): Promise<Professional | undefined>;
  deleteProfessional(id: number): Promise<boolean>;

  // Nuevos métodos para ratings y recomendaciones
  addRating(userId: number, rating: InsertRating): Promise<Rating>;
  getProfessionalRatings(professionalId: number): Promise<Rating[]>;
  getRecommendations(userId: number): Promise<Professional[]>;
  updateRecommendations(userId: number): Promise<void>;
  deleteUser(id: number): Promise<boolean>; // Added deleteUser method

  updateUser(id: number, user: Partial<User>): Promise<User | undefined>; // Added updateUser method

  sessionStore: session.Store;

  // Métodos para categorías
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getSubcategories(parentId: number): Promise<Category[]>;

  // Métodos para relaciones profesional-categoría
  assignProfessionalToCategory(professionalId: number, categoryId: number): Promise<ProfessionalCategory>;
  removeProfessionalFromCategory(professionalId: number, categoryId: number): Promise<boolean>;
  getProfessionalsByCategory(categoryId: number): Promise<Professional[]>;
  getCategoriesByProfessional(professionalId: number): Promise<Category[]>;

  // Nuevos métodos para configuración del sistema
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createUserWithRole(
    insertUser: InsertUser,
    isAdmin: boolean,
    isSuperAdmin: boolean
  ): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isAdmin,
        isSuperAdmin,
      })
      .returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isAdmin: role === "admin" || role === "superadmin",
        isSuperAdmin: role === "superadmin",
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getProfessionals(): Promise<Professional[]> {
    return await db.select().from(professionals);
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, id));
    return professional;
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [created] = await db.insert(professionals).values(professional).returning();
    return created;
  }

  async updateProfessional(
    id: number,
    update: Partial<InsertProfessional>,
  ): Promise<Professional | undefined> {
    const [professional] = await db
      .update(professionals)
      .set(update)
      .where(eq(professionals.id, id))
      .returning();
    return professional;
  }

  async deleteProfessional(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(professionals)
      .where(eq(professionals.id, id))
      .returning();
    return !!deleted;
  }

  async addRating(userId: number, rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings)
      .values({ ...rating, userId })
      .returning();

    // Actualizar el promedio de calificaciones del profesional
    await db.transaction(async (tx) => {
      const [professional] = await tx.select({
        totalRatings: professionals.totalRatings,
        averageRating: professionals.averageRating,
      })
        .from(professionals)
        .where(eq(professionals.id, rating.professionalId));

      const newTotal = (professional.totalRatings || 0) + 1;
      const newAverage = Math.round(
        ((professional.averageRating || 0) * (professional.totalRatings || 0) + rating.rating) / newTotal
      );

      await tx.update(professionals)
        .set({
          totalRatings: newTotal,
          averageRating: newAverage,
        })
        .where(eq(professionals.id, rating.professionalId));
    });

    return newRating;
  }

  async getProfessionalRatings(professionalId: number): Promise<Rating[]> {
    return await db.select()
      .from(ratings)
      .where(eq(ratings.professionalId, professionalId))
      .orderBy(desc(ratings.createdAt));
  }

  async getRecommendations(userId: number): Promise<Professional[]> {
    // Obtener profesionales recomendados basados en:
    // 1. Calificaciones altas
    // 2. Profesionales similares (misma ocupación)
    // 3. Ubicación
    const userRatings = await db.select()
      .from(ratings)
      .where(eq(ratings.userId, userId));

    // Si el usuario no tiene calificaciones, devolver los mejores calificados
    if (userRatings.length === 0) {
      return await db.select()
        .from(professionals)
        .orderBy(desc(professionals.averageRating))
        .limit(5);
    }

    // Obtener profesionales con ocupaciones similares a los que el usuario ha calificado bien
    const likedProfessionals = await db.select()
      .from(professionals)
      .where(
        sql`${professionals.occupation} IN (
          SELECT p.occupation FROM ${professionals} p
          JOIN ${ratings} r ON r.professional_id = p.id
          WHERE r.user_id = ${userId} AND r.rating >= 4
        )`
      )
      .orderBy(desc(professionals.averageRating))
      .limit(5);

    return likedProfessionals;
  }

  async updateRecommendations(userId: number): Promise<void> {
    // Actualizar las recomendaciones para un usuario
    const recommendedProfessionals = await this.getRecommendations(userId);

    // Limpiar recomendaciones anteriores
    await db.delete(recommendations)
      .where(eq(recommendations.userId, userId));

    // Insertar nuevas recomendaciones
    for (const professional of recommendedProfessionals) {
      await db.insert(recommendations)
        .values({
          userId,
          professionalId: professional.id,
          score: professional.averageRating || 0,
        });
    }
  }

  async deleteUser(id: number): Promise<boolean> { // Added deleteUser method implementation
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deleted;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    // Si se incluye una nueva contraseña, necesitamos hashearla
    if (update.password) {
      update.password = await hashPassword(update.password);
    }

    const [user] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Implementación de métodos de categorías
  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: number, update: Partial<Category>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(update)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return !!deleted;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    return category;
  }

  async getSubcategories(parentId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, parentId));
  }

  // Implementación de métodos de relación profesional-categoría
  async assignProfessionalToCategory(
    professionalId: number,
    categoryId: number
  ): Promise<ProfessionalCategory> {
    const [assignment] = await db
      .insert(professionalCategories)
      .values({ professionalId, categoryId })
      .returning();
    return assignment;
  }

  async removeProfessionalFromCategory(
    professionalId: number,
    categoryId: number
  ): Promise<boolean> {
    const [deleted] = await db
      .delete(professionalCategories)
      .where(
        and(
          eq(professionalCategories.professionalId, professionalId),
          eq(professionalCategories.categoryId, categoryId)
        )
      )
      .returning();
    return !!deleted;
  }

  async getProfessionalsByCategory(categoryId: number): Promise<Professional[]> {
    return await db
      .select()
      .from(professionals)
      .innerJoin(
        professionalCategories,
        eq(professionals.id, professionalCategories.professionalId)
      )
      .where(eq(professionalCategories.categoryId, categoryId));
  }

  async getCategoriesByProfessional(professionalId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .innerJoin(
        professionalCategories,
        eq(categories.id, professionalCategories.categoryId)
      )
      .where(eq(professionalCategories.professionalId, professionalId));
  }

  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db
      .select()
      .from(systemSettings)
      .orderBy(desc(systemSettings.updatedAt))
      .limit(1);
    return settings;
  }

  async updateSystemSettings(update: Partial<SystemSettings>): Promise<SystemSettings> {
    const [settings] = await db
      .insert(systemSettings)
      .values({
        ...update,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.id,
        set: {
          ...update,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();