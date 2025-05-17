import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { 
  db, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  deleteDoc,
  doc,
  ARTICLE_STATES 
} from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate, getStatusColor, getCategoryColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ArticlesManagement() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filter, setFilter] = useState({
    status: "all",
    category: "all",
    searchTerm: ""
  });
  
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user, filter.status, filter.category]);
  
  const fetchArticles = async (searchAfterDoc = null) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Build query
      const articlesRef = collection(db, "articles");
      let constraints = [];
      
      // Only show articles by the current user (unless admin role is implemented)
      constraints.push(where("authorId", "==", user.uid));
      
      // Filter by status if selected
      if (filter.status !== "all") {
        constraints.push(where("state", "==", filter.status));
      }
      
      // Filter by category if selected
      if (filter.category !== "all") {
        constraints.push(where("categories", "array-contains", filter.category));
      }
      
      // Add ordering and pagination
      constraints.push(orderBy("updatedAt", "desc"));
      constraints.push(limit(10));
      
      // For pagination
      if (searchAfterDoc) {
        constraints.push(startAfter(searchAfterDoc));
      }
      
      const q = query(articlesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const articleDocs = [];
      querySnapshot.forEach((doc) => {
        articleDocs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Apply search filter client-side (for simplicity)
      const filteredArticles = filter.searchTerm 
        ? articleDocs.filter(article => 
            article.title.toLowerCase().includes(filter.searchTerm.toLowerCase())
          )
        : articleDocs;
      
      if (searchAfterDoc) {
        setArticles(prev => [...prev, ...filteredArticles]);
      } else {
        setArticles(filteredArticles);
      }
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(querySnapshot.docs.length === 10);
      setCurrentPage(searchAfterDoc ? currentPage + 1 : 1);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const loadMoreArticles = async () => {
    if (!lastDoc || loadingMore) return;
    
    setLoadingMore(true);
    await fetchArticles(lastDoc);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // This is handled by the useEffect when filter changes
    setArticles([]);
    setLastDoc(null);
    setHasMore(true);
    fetchArticles();
  };
  
  const handleDeleteArticle = async (articleId) => {
    try {
      await deleteDoc(doc(db, "articles", articleId));
      
      // Update UI
      setArticles(articles.filter(article => article.id !== articleId));
      
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (authLoading || (loading && articles.length === 0)) {
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
    <div className="py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Articles</h1>
            <p className="text-gray-600">Manage your articles and publication workflow</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/editor">
              <Button className="flex items-center">
                <i className="ri-add-line mr-1"></i> New Article
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <nav className="flex flex-wrap">
            <Link href="/admin">
              <Button variant="ghost" className="px-4 py-4 font-medium text-gray-600 dark:text-gray-300 hover:text-primary rounded-none">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/articles">
              <Button variant="ghost" className="px-4 py-4 font-medium text-primary border-b-2 border-primary rounded-none">
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
        
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-xl font-bold">All Articles</h2>
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <div className="min-w-[150px]">
                  <Select
                    value={filter.status}
                    onValueChange={(value) => setFilter({...filter, status: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={ARTICLE_STATES.PUBLISHED}>Published</SelectItem>
                      <SelectItem value={ARTICLE_STATES.DRAFT}>Draft</SelectItem>
                      <SelectItem value={ARTICLE_STATES.PENDING_REVIEW}>Pending Review</SelectItem>
                      <SelectItem value={ARTICLE_STATES.SCHEDULED}>Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[150px]">
                  <Select
                    value={filter.category}
                    onValueChange={(value) => setFilter({...filter, category: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Startups">Startups</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={filter.searchTerm}
                    onChange={(e) => setFilter({...filter, searchTerm: e.target.value})}
                    className="min-w-[200px]"
                  />
                  <Button type="submit">Search</Button>
                </form>
              </div>
            </div>
            
            {/* Articles Table */}
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
                  {articles.length > 0 ? (
                    articles.map((article: any) => (
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-gray-500 mr-3"
                            onClick={() => navigate(`/article/${article.slug}`)}
                          >
                            View
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the article
                                  "{article.title}" and remove it from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteArticle(article.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {loading ? (
                          <div className="flex justify-center items-center">
                            <i className="ri-loader-4-line animate-spin mr-2"></i> Loading articles...
                          </div>
                        ) : (
                          <>No articles found. Create your first article to get started.</>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {articles.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
                </p>
                {hasMore && (
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      onClick={loadMoreArticles}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i> Loading...
                        </>
                      ) : (
                        <>Load More</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
