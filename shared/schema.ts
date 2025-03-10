import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id").references(() => categories.id),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  occupation: text("occupation").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url").notNull(),
  whatsapp: text("whatsapp").notNull(),
  detailedDescription: text("detailed_description").notNull(),
  location: text("location").notNull().default(''),
  averageRating: integer("average_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const professionalCategories = pgTable("professional_categories", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  showRatings: boolean("show_ratings").notNull().default(true),
  allowRatings: boolean("allow_ratings").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  isAdmin: z.boolean().optional().default(false),
  isSuperAdmin: z.boolean().optional().default(false),
});

export const insertCategorySchema = createInsertSchema(categories);
export const insertProfessionalSchema = createInsertSchema(professionals);
export const insertProfessionalCategorySchema = createInsertSchema(professionalCategories);
export const insertRatingSchema = createInsertSchema(ratings).pick({
  professionalId: true,
  rating: true,
  comment: true,
});
export const systemSettingsSchema = createInsertSchema(systemSettings);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type ProfessionalCategory = typeof professionalCategories.$inferSelect;
export type InsertProfessionalCategory = z.infer<typeof insertProfessionalCategorySchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof systemSettingsSchema>;