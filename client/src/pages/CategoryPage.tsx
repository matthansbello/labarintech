import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { fetchArticles, ARTICLE_STATES } from "@/lib/firebase";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const categoryName = params?.category || '';
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
  useEffect(() => {
    async function fetchCategoryArticles() {
      if (!categoryName) return;
      
      try {
        setLoading(true);
        setArticles([]);
        
        const { articles: fetchedArticles, lastDoc: lastDocument } = await fetchArticles({
          state: ARTICLE_STATES.PUBLISHED,
          category: formattedCategory,
          limit: 9
        });
        
        setArticles(fetchedArticles);
        setLastDoc(lastDocument);
        setHasMore(fetchedArticles.length === 9);
      } catch (error) {
        console.error("Error fetching category articles:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategoryArticles();
  }, [categoryName, formattedCategory]);
  
  const loadMoreArticles = async () => {
    if (!lastDoc || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      const { articles: moreArticles, lastDoc: newLastDoc } = await fetchArticles({
        state: ARTICLE_STATES.PUBLISHED,
        category: formattedCategory,
        limit: 9,
        startAfter: lastDoc
      });
      
      setArticles(prevArticles => [...prevArticles, ...moreArticles]);
      setLastDoc(newLastDoc);
      setHasMore(moreArticles.length === 9);
    } catch (error) {
      console.error("Error loading more articles:", error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{formattedCategory}</h1>
          <p className="text-gray-600">
            {formattedCategory === 'Latest' 
              ? 'The most recent articles and updates from LabarinTech' 
              : `Explore our collection of articles about ${formattedCategory.toLowerCase()}`}
          </p>
        </div>
        
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">We couldn't find any articles in this category.</p>
          </div>
        )}
        
        {hasMore && (
          <div className="flex justify-center mt-10">
            <Button
              onClick={loadMoreArticles}
              disabled={loadingMore}
              className="flex items-center space-x-2"
            >
              {loadingMore ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More</span>
                  <i className="ri-arrow-down-line"></i>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
