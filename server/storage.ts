import { 
  type User, 
  type InsertUser, 
  type Article,
  type InsertArticle,
  type Category,
  type InsertCategory,
  type ArticleRevision,
  type InsertArticleRevision,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Article operations
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticles(options?: { 
    limit?: number, 
    page?: number, 
    category?: string, 
    tag?: string, 
    featured?: boolean,
    state?: string,
  }): Promise<{ articles: Article[], total: number, page: number, totalPages: number }>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Article revision operations
  getArticleRevisions(articleId: number): Promise<ArticleRevision[]>;
  createArticleRevision(revision: InsertArticleRevision): Promise<ArticleRevision>;
  
  // Newsletter operations
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  unsubscribeFromNewsletter(email: string): Promise<boolean>;
  
  // Search operation
  searchArticles(query: string, limit?: number): Promise<Article[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private categories: Map<number, Category>;
  private articleRevisions: Map<number, ArticleRevision>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  
  private nextUserId: number;
  private nextArticleId: number;
  private nextCategoryId: number;
  private nextRevisionId: number;
  private nextSubscriberId: number;
  
  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.categories = new Map();
    this.articleRevisions = new Map();
    this.newsletterSubscribers = new Map();
    
    this.nextUserId = 1;
    this.nextArticleId = 1;
    this.nextCategoryId = 1;
    this.nextRevisionId = 1;
    this.nextSubscriberId = 1;
    
    // Initialize with default categories
    this.initializeDefaults();
  }
  
  private initializeDefaults() {
    // Add default categories
    const defaultCategories = [
      { name: 'Programming', slug: 'programming', description: 'Programming articles and tutorials' },
      { name: 'AI', slug: 'ai', description: 'Artificial Intelligence news and insights' },
      { name: 'Mobile', slug: 'mobile', description: 'Mobile technology and app development' },
      { name: 'Hardware', slug: 'hardware', description: 'Hardware reviews and tech gadgets' },
      { name: 'Startups', slug: 'startups', description: 'Startup news and funding updates' },
      { name: 'Education', slug: 'education', description: 'Tech education and learning resources' }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory({
        name: category.name,
        slug: category.slug,
        description: category.description
      });
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userUpdate,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Article operations
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => article.slug === slug);
  }
  
  async getArticles(options: { 
    limit?: number, 
    page?: number, 
    category?: string, 
    tag?: string, 
    featured?: boolean,
    state?: string 
  } = {}): Promise<{ articles: Article[], total: number, page: number, totalPages: number }> {
    let articles = Array.from(this.articles.values());
    
    // Apply filters
    if (options.category) {
      articles = articles.filter(article => 
        article.categories && article.categories.includes(options.category!)
      );
    }
    
    if (options.tag) {
      articles = articles.filter(article => 
        article.tags && article.tags.includes(options.tag!)
      );
    }
    
    if (options.featured) {
      articles = articles.filter(article => article.featured);
    }
    
    if (options.state) {
      articles = articles.filter(article => article.state === options.state);
    }
    
    // Sort by published date, newest first
    articles.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    const page = options.page || 1;
    const limit = options.limit || 10;
    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    
    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedArticles = articles.slice(start, end);
    
    return {
      articles: paginatedArticles,
      total,
      page,
      totalPages
    };
  }
  
  async createArticle(articleData: InsertArticle): Promise<Article> {
    const id = this.nextArticleId++;
    const now = new Date();
    const newArticle: Article = {
      ...articleData,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }
  
  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle: Article = {
      ...article,
      ...articleUpdate,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    if (!this.articles.has(id)) return false;
    
    this.articles.delete(id);
    
    // Delete all revisions for this article
    for (const [revId, rev] of this.articleRevisions.entries()) {
      if (rev.articleId === id) {
        this.articleRevisions.delete(revId);
      }
    }
    
    return true;
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.nextCategoryId++;
    const now = new Date();
    const newCategory: Category = {
      ...categoryData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = {
      ...category,
      ...categoryUpdate,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    if (!this.categories.has(id)) return false;
    this.categories.delete(id);
    return true;
  }
  
  // Article revision operations
  async getArticleRevisions(articleId: number): Promise<ArticleRevision[]> {
    return Array.from(this.articleRevisions.values())
      .filter(revision => revision.articleId === articleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createArticleRevision(revisionData: InsertArticleRevision): Promise<ArticleRevision> {
    const id = this.nextRevisionId++;
    const now = new Date();
    const newRevision: ArticleRevision = {
      ...revisionData,
      id,
      createdAt: now
    };
    this.articleRevisions.set(id, newRevision);
    return newRevision;
  }
  
  // Newsletter operations
  async subscribeToNewsletter(subscriberData: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    // Check if email already exists
    const existingSubscriber = Array.from(this.newsletterSubscribers.values())
      .find(sub => sub.email === subscriberData.email);
    
    if (existingSubscriber) {
      if (existingSubscriber.unsubscribed) {
        // Re-subscribe
        const updatedSubscriber: NewsletterSubscriber = {
          ...existingSubscriber,
          unsubscribed: false,
          subscriptionDate: new Date()
        };
        this.newsletterSubscribers.set(existingSubscriber.id, updatedSubscriber);
        return updatedSubscriber;
      }
      return existingSubscriber;
    }
    
    const id = this.nextSubscriberId++;
    const now = new Date();
    const newSubscriber: NewsletterSubscriber = {
      ...subscriberData,
      id,
      subscriptionDate: now,
      unsubscribed: false
    };
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const subscriber = Array.from(this.newsletterSubscribers.values())
      .find(sub => sub.email === email);
    
    if (!subscriber) return false;
    
    const updatedSubscriber: NewsletterSubscriber = {
      ...subscriber,
      unsubscribed: true
    };
    
    this.newsletterSubscribers.set(subscriber.id, updatedSubscriber);
    return true;
  }
  
  // Search operation
  async searchArticles(query: string, limit: number = 10): Promise<Article[]> {
    query = query.toLowerCase();
    
    // Simple search implementation
    let results = Array.from(this.articles.values())
      .filter(article => {
        // Only search published articles
        if (article.state !== 'published') return false;
        
        // Search in title, content, excerpt
        return (
          article.title.toLowerCase().includes(query) ||
          (article.content && article.content.toLowerCase().includes(query)) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(query)) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query))) ||
          (article.categories && article.categories.some(category => category.toLowerCase().includes(query)))
        );
      });
    
    // Sort by relevance (simple implementation)
    results.sort((a, b) => {
      const titleMatchA = a.title.toLowerCase().includes(query) ? 10 : 0;
      const titleMatchB = b.title.toLowerCase().includes(query) ? 10 : 0;
      
      return titleMatchB - titleMatchA;
    });
    
    return results.slice(0, limit);
  }
}

export const storage = new MemStorage();
