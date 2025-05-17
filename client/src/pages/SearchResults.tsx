import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { searchArticles } from "@/lib/firebase";
import ArticleCard from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchResults() {
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Extract query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [location]);
  
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchArticles(searchQuery, 20);
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      // Update URL without refreshing page
      window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Search Results</h1>
          
          <form onSubmit={handleSubmit} className="relative mb-10">
            <Input
              type="text"
              placeholder="Search for articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-3 text-lg"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <i className="ri-search-line text-lg"></i>
            </span>
            <Button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              {loading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                "Search"
              )}
            </Button>
          </form>
          
          {query && (
            <p className="text-gray-600 mb-8">
              {loading ? (
                "Searching..."
              ) : results.length > 0 ? (
                `Found ${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"`
              ) : (
                `No results found for "${query}"`
              )}
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-500">Searching for articles...</p>
            </div>
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : query && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any articles matching your search.</p>
                <div className="max-w-md mx-auto">
                  <h4 className="font-medium mb-2">Suggestions:</h4>
                  <ul className="text-gray-600 list-disc list-inside text-left">
                    <li>Check your spelling</li>
                    <li>Try more general keywords</li>
                    <li>Try different keywords</li>
                    <li>Browse our categories for relevant content</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
