import { Link } from "wouter";
import { formatDate, getArticleExcerpt, getCategoryColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import CategoryBadge from "./CategoryBadge";

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage: string;
    categories: string[];
    publishedAt: any;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  variant?: "default" | "featured" | "secondary";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const excerpt = article.excerpt || getArticleExcerpt(article.content);
  const formattedDate = formatDate(article.publishedAt?.toDate ? article.publishedAt.toDate() : article.publishedAt);
  
  // Featured article variant (large card)
  if (variant === "featured") {
    return (
      <div className="lg:col-span-2 relative group overflow-hidden rounded-xl shadow-lg">
        <Link href={`/article/${article.slug}`}>
          <img 
            src={article.featuredImage} 
            alt={article.title} 
            className="w-full h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex flex-col justify-end p-6">
          <CategoryBadge category="FEATURE" className="mb-3 inline-block" />
          <Link href={`/article/${article.slug}`}>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">{article.title}</h2>
          </Link>
          <p className="text-white/90 mb-4 line-clamp-2">{excerpt}</p>
          <div className="flex items-center text-white/80">
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src={article.author.avatar} alt={article.author.name} />
              <AvatarFallback>{getInitials(article.author.name)}</AvatarFallback>
            </Avatar>
            <span>By {article.author.name}</span>
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Secondary featured article variant (smaller card with overlay)
  if (variant === "secondary") {
    return (
      <div className="relative group overflow-hidden rounded-xl shadow-lg">
        <Link href={`/article/${article.slug}`}>
          <img 
            src={article.featuredImage} 
            alt={article.title} 
            className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex flex-col justify-end p-4">
          <CategoryBadge category={article.categories[0]} className="mb-2 inline-block" />
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-white text-lg font-bold mb-1">{article.title}</h3>
          </Link>
          <div className="flex items-center text-white/80 text-sm">
            <span>By {article.author.name}</span>
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Default article card
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/article/${article.slug}`}>
        <img 
          src={article.featuredImage} 
          alt={article.title} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <CategoryBadge category={article.categories[0]} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</span>
        </div>
        <Link href={`/article/${article.slug}`} className="block">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{excerpt}</p>
        <div className="flex items-center text-sm">
          <Avatar className="w-7 h-7 mr-2">
            <AvatarImage src={article.author.avatar} alt={article.author.name} />
            <AvatarFallback>{getInitials(article.author.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{article.author.name}</span>
        </div>
      </div>
    </div>
  );
}
