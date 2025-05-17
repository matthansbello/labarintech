import { useEffect, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Link } from "wouter";
import { db, fetchArticles, ARTICLE_STATES } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [programmingArticles, setProgrammingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchHomePageData() {
      try {
        // Fetch featured articles
        const { articles: featured } = await fetchArticles({
          featured: true,
          state: ARTICLE_STATES.PUBLISHED,
          limit: 3
        });
        setFeaturedArticles(featured);
        
        // Fetch latest articles
        const { articles: latest } = await fetchArticles({
          state: ARTICLE_STATES.PUBLISHED,
          limit: 3
        });
        setLatestArticles(latest);
        
        // Fetch programming articles
        const { articles: programming } = await fetchArticles({
          state: ARTICLE_STATES.PUBLISHED,
          category: "Programming",
          limit: 3
        });
        setProgrammingArticles(programming);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHomePageData();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Loading latest articles...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6 md:py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredArticles.length > 0 && (
              <>
                {/* Main Featured Article */}
                <ArticleCard article={featuredArticles[0]} variant="featured" />
                
                {/* Secondary Featured Articles */}
                <div className="lg:col-span-1 space-y-6">
                  {featuredArticles.slice(1, 3).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="secondary" />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Latest News */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest News</h2>
            <Link href="/category/latest" className="text-primary font-medium hover:underline flex items-center">
              View All <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        
        {/* Category Highlights - Programming */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Programming</h2>
            <Link href="/category/programming" className="text-primary font-medium hover:underline flex items-center">
              More in Programming <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programmingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <NewsletterSignup />
        
        {/* Trending Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Topics</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tag/ArtificialIntelligence">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>ArtificialIntelligence
              </Button>
            </Link>
            <Link href="/tag/StartupsFunding">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>StartupsFunding
              </Button>
            </Link>
            <Link href="/tag/ReactJS">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>ReactJS
              </Button>
            </Link>
            <Link href="/tag/5GTechnology">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>5GTechnology
              </Button>
            </Link>
            <Link href="/tag/CyberSecurity">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>CyberSecurity
              </Button>
            </Link>
            <Link href="/tag/DigitalLiteracy">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>DigitalLiteracy
              </Button>
            </Link>
            <Link href="/tag/TechEvents">
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-full shadow-sm border border-gray-200 flex items-center">
                <i className="ri-hashtag text-primary"></i>TechEvents
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
