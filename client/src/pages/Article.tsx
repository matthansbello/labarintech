import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { db, doc, getDoc, collection, query, where, getDocs, limit } from "@/lib/firebase";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CategoryBadge from "@/components/CategoryBadge";
import ArticleCard from "@/components/ArticleCard";
import { getInitials } from "@/lib/utils";

export default function Article() {
  const [, params] = useRoute("/article/:slug");
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchArticleData() {
      if (!params?.slug) return;
      
      try {
        setLoading(true);
        
        // Get article by slug
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, where("slug", "==", params.slug), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.error("Article not found");
          setLoading(false);
          return;
        }
        
        const articleData = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
        setArticle(articleData);
        
        // Get author
        if (articleData.authorId) {
          const authorDoc = await getDoc(doc(db, "users", articleData.authorId));
          if (authorDoc.exists()) {
            setAuthor({
              id: authorDoc.id,
              ...authorDoc.data()
            });
          }
        }
        
        // Get related articles based on categories
        if (articleData.categories && articleData.categories.length > 0) {
          const relatedQuery = query(
            articlesRef,
            where("categories", "array-contains-any", articleData.categories),
            where("slug", "!=", params.slug),
            limit(2)
          );
          const relatedSnapshot = await getDocs(relatedQuery);
          const relatedData = relatedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRelatedArticles(relatedData);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticleData();
  }, [params?.slug]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const readingTime = calculateReadingTime(article.content);
  const publishedDate = formatDate(article.publishedAt?.toDate ? article.publishedAt.toDate() : article.publishedAt);
  
  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Article Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="mb-4">
            <Link href="/" className="text-primary hover:underline inline-flex items-center mb-4">
              <i className="ri-arrow-left-line mr-1"></i> Back to Articles
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{article.title}</h1>
            <p className="text-gray-600 text-lg mb-6">{article.excerpt}</p>
            
            <div className="flex items-center mb-4">
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={author?.avatar} alt={author?.name} />
                <AvatarFallback>{getInitials(author?.name || "Unknown Author")}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{author?.name || "Unknown Author"}</h3>
                <span className="text-gray-500 text-sm">{author?.role || "Contributor"}</span>
              </div>
              <span className="mx-3 text-gray-300">|</span>
              <div className="text-gray-500">
                <span>{publishedDate}</span>
                <span className="mx-2">•</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mb-6">
              {article.categories && article.categories.map((category, index) => (
                <CategoryBadge key={index} category={category} />
              ))}
            </div>
          </div>
          
          {article.featuredImage && (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-auto rounded-xl shadow-md mb-8"
            />
          )}
        </div>
        
        {/* Article Content */}
        <div className="max-w-3xl mx-auto article-content">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
          
          {/* Social Sharing */}
          <div className="border-t border-gray-200 mt-10 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-2">Share this article</h4>
                <div className="flex space-x-2">
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#1da1f2] text-white p-2 rounded-full hover:bg-opacity-90 transition"
                  >
                    <i className="ri-twitter-fill text-lg"></i>
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#1877f2] text-white p-2 rounded-full hover:bg-opacity-90 transition"
                  >
                    <i className="ri-facebook-fill text-lg"></i>
                  </a>
                  <a 
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#0077b5] text-white p-2 rounded-full hover:bg-opacity-90 transition"
                  >
                    <i className="ri-linkedin-fill text-lg"></i>
                  </a>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ': ' + window.location.href)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#25d366] text-white p-2 rounded-full hover:bg-opacity-90 transition"
                  >
                    <i className="ri-whatsapp-fill text-lg"></i>
                  </a>
                  <a 
                    href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#0088cc] text-white p-2 rounded-full hover:bg-opacity-90 transition"
                  >
                    <i className="ri-telegram-fill text-lg"></i>
                  </a>
                </div>
              </div>
              <div>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition">
                  <i className="ri-bookmark-line text-lg"></i>
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Author Bio */}
          {author && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mt-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold mb-2">{author.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{author.bio || `${author.name} is a contributor at LabarinTech.`}</p>
                  <div className="flex space-x-3">
                    {author.twitter && (
                      <a href={author.twitter} className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                        <i className="ri-twitter-fill text-lg"></i>
                      </a>
                    )}
                    {author.linkedin && (
                      <a href={author.linkedin} className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                        <i className="ri-linkedin-fill text-lg"></i>
                      </a>
                    )}
                    {author.email && (
                      <a href={`mailto:${author.email}`} className="text-primary hover:text-primary/80">
                        <i className="ri-mail-fill text-lg"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
