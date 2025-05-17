import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchArticles } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);
  
  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const searchResults = await searchArticles(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="p-4 border-b">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <i className="ri-search-line"></i>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <i className="ri-close-line"></i>
            </Button>
          </form>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <i className="ri-loader-4-line animate-spin text-xl inline-block mr-2"></i>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y">
              {results.map((article: any) => (
                <li key={article.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <a
                    href={`/article/${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/article/${article.slug}`);
                      onClose();
                    }}
                    className="flex items-start gap-4"
                  >
                    {article.featuredImage && (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium mb-1">{article.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {article.excerpt}
                      </p>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(article.publishedAt?.toDate ? article.publishedAt.toDate() : article.publishedAt)}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : query.length > 1 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
        
        <div className="p-4 border-t text-center">
          <Button
            onClick={() => {
              if (query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
                onClose();
              }
            }}
            variant="default"
            disabled={query.length < 2}
          >
            View all results
          </Button>
        </div>
      </div>
    </div>
  );
}
