import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { db, collection, getDocs, query, where, ARTICLE_STATES } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    published: 0,
    pendingReview: 0,
    totalViews: 0,
    subscribers: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch article counts
        const articlesRef = collection(db, "articles");
        const publishedQuery = query(articlesRef, where("state", "==", ARTICLE_STATES.PUBLISHED));
        const pendingQuery = query(articlesRef, where("state", "==", ARTICLE_STATES.PENDING_REVIEW));
        
        const [publishedSnapshot, pendingSnapshot, subscribersSnapshot, recentArticlesSnapshot] = await Promise.all([
          getDocs(publishedQuery),
          getDocs(pendingQuery),
          getDocs(collection(db, "newsletter_subscribers")),
          getDocs(query(articlesRef, where("authorId", "==", user.uid)))
        ]);
        
        // Get total views (in a real app, this would come from analytics)
        let totalViews = 0;
        publishedSnapshot.forEach(doc => {
          const views = doc.data().views || 0;
          totalViews += views;
        });
        
        setStats({
          published: publishedSnapshot.size,
          pendingReview: pendingSnapshot.size,
          totalViews,
          subscribers: subscribersSnapshot.size
        });
        
        // Get recent articles
        const articlesData = recentArticlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentArticles(articlesData.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [user]);
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Manage your content and publication workflow</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/editor">
              <Button className="flex items-center">
                <i className="ri-add-line mr-1"></i> New Article
              </Button>
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback>{getInitials(user.displayName || user.email || "User")}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Admin Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <nav className="flex flex-wrap">
            <Link href="/admin">
              <Button variant="ghost" className="px-4 py-4 font-medium text-primary border-b-2 border-primary rounded-none">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/articles">
              <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
                Articles
              </Button>
            </Link>
            <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
              Categories
            </Button>
            <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
              Media
            </Button>
            <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
              Users
            </Button>
            <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
              Analytics
            </Button>
            <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
              Settings
            </Button>
          </nav>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat Card 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Published Articles</h3>
                <span className="text-primary bg-primary/10 p-2 rounded-full">
                  <i className="ri-article-line"></i>
                </span>
              </div>
              <p className="text-3xl font-bold">{stats.published}</p>
              <p className="text-sm text-green-500 flex items-center mt-2">
                <i className="ri-arrow-up-line mr-1"></i> 12% from last month
              </p>
            </CardContent>
          </Card>
          
          {/* Stat Card 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Pending Review</h3>
                <span className="text-warning bg-warning/10 p-2 rounded-full">
                  <i className="ri-time-line"></i>
                </span>
              </div>
              <p className="text-3xl font-bold">{stats.pendingReview}</p>
              <p className="text-sm text-yellow-500 flex items-center mt-2">
                <i className="ri-arrow-up-line mr-1"></i> {stats.pendingReview} new since yesterday
              </p>
            </CardContent>
          </Card>
          
          {/* Stat Card 3 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Total Views</h3>
                <span className="text-secondary bg-secondary/10 p-2 rounded-full">
                  <i className="ri-eye-line"></i>
                </span>
              </div>
              <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-green-500 flex items-center mt-2">
                <i className="ri-arrow-up-line mr-1"></i> 18% from last month
              </p>
            </CardContent>
          </Card>
          
          {/* Stat Card 4 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Newsletter Subscribers</h3>
                <span className="text-accent bg-accent/10 p-2 rounded-full">
                  <i className="ri-mail-line"></i>
                </span>
              </div>
              <p className="text-3xl font-bold">{stats.subscribers.toLocaleString()}</p>
              <p className="text-sm text-green-500 flex items-center mt-2">
                <i className="ri-arrow-up-line mr-1"></i> 5% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Article Management */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Articles</h2>
              <Link href="/admin/articles">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {recentArticles.length > 0 ? (
                    recentArticles.map((article: any) => (
                      <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {article.featuredImage ? (
                              <img 
                                src={article.featuredImage} 
                                alt={article.title} 
                                className="w-10 h-10 rounded object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                                <i className="ri-draft-line"></i>
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.title}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {article.categories && article.categories.length > 0 && (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(article.categories[0])}`}>
                              {article.categories[0]}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(article.state)}`}>
                            {article.state.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(article.updatedAt?.toDate ? article.updatedAt.toDate() : article.updatedAt || article.createdAt?.toDate ? article.createdAt.toDate() : article.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/admin/editor/${article.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 mr-3">Edit</Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500 mr-3">
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No articles found. Create your first article to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
