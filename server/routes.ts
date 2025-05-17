import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertArticleSchema, 
  insertNewsletterSubscriberSchema, 
  insertUserSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = app.route('/api');

  // Articles API
  app.get('/api/articles', async (req, res) => {
    try {
      const { category, tag, featured, limit = '10', page = '1' } = req.query;
      
      const options: any = {
        limit: parseInt(limit as string),
        page: parseInt(page as string)
      };
      
      if (category) options.category = category as string;
      if (tag) options.tag = tag as string;
      if (featured === 'true') options.featured = true;
      
      const articles = await storage.getArticles(options);
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const article = await storage.getArticle(parseInt(req.params.id));
      
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      
      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ message: 'Failed to fetch article' });
    }
  });

  app.post('/api/articles', async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const newArticle = await storage.createArticle(validatedData);
      res.status(201).json(newArticle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid article data', errors: error.errors });
      }
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Failed to create article' });
    }
  });

  app.put('/api/articles/:id', async (req, res) => {
    try {
      const validatedData = insertArticleSchema.partial().parse(req.body);
      const updatedArticle = await storage.updateArticle(parseInt(req.params.id), validatedData);
      
      if (!updatedArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid article data', errors: error.errors });
      }
      console.error('Error updating article:', error);
      res.status(500).json({ message: 'Failed to update article' });
    }
  });

  app.delete('/api/articles/:id', async (req, res) => {
    try {
      const success = await storage.deleteArticle(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: 'Article not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ message: 'Failed to delete article' });
    }
  });

  // Categories API
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Newsletter Subscription API
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.subscribeToNewsletter(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid subscriber data', errors: error.errors });
      }
      console.error('Error subscribing to newsletter:', error);
      res.status(500).json({ message: 'Failed to subscribe to newsletter' });
    }
  });

  // Search API
  app.get('/api/search', async (req, res) => {
    try {
      const { q, limit = '10' } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const results = await storage.searchArticles(q as string, parseInt(limit as string));
      res.json(results);
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({ message: 'Failed to search articles' });
    }
  });

  // User API
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(validatedData);
      
      // Don't send the password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
