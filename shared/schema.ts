import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar_url"),
  role: text("role").notNull().default('author'),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  firebaseId: text("firebase_id").unique(),
});

// Categories Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Articles Schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  state: text("state").notNull().default('draft'),
  featuredImage: text("featured_image"),
  categories: text("categories").array(),
  tags: text("tags").array(),
  views: integer("views").default(0),
  featured: boolean("featured").default(false),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  firebaseId: text("firebase_id").unique(),
});

// Article Revisions Schema
export const articleRevisions = pgTable("article_revisions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => articles.id).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  note: text("note"),
});

// Newsletter Subscribers Schema
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  confirmed: boolean("confirmed").default(false),
  unsubscribed: boolean("unsubscribed").default(false),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  avatar: true,
  role: true,
  bio: true,
  firebaseId: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  parentId: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  authorId: true,
  state: true,
  featuredImage: true,
  categories: true,
  tags: true,
  featured: true,
  metaDescription: true,
  publishedAt: true,
  firebaseId: true,
});

export const insertArticleRevisionSchema = createInsertSchema(articleRevisions).pick({
  articleId: true,
  content: true,
  authorId: true,
  note: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
  name: true,
  confirmed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertArticleRevision = z.infer<typeof insertArticleRevisionSchema>;
export type ArticleRevision = typeof articleRevisions.$inferSelect;

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
