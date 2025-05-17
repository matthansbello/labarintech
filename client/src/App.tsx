import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Article from "@/pages/Article";
import CategoryPage from "@/pages/CategoryPage";
import SearchResults from "@/pages/SearchResults";
import Dashboard from "@/pages/admin/Dashboard";
import ArticlesManagement from "@/pages/admin/ArticlesManagement";
import Editor from "@/pages/admin/Editor";
import Login from "@/pages/admin/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from "@/lib/authContext";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={{ user, loading }}>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/article/:slug" component={Article} />
                <Route path="/category/:category" component={CategoryPage} />
                <Route path="/search" component={SearchResults} />
                
                {/* Admin Routes */}
                <Route path="/admin" component={Dashboard} />
                <Route path="/admin/articles" component={ArticlesManagement} />
                <Route path="/admin/editor/:id?" component={Editor} />
                <Route path="/admin/login" component={Login} />
                
                {/* Fallback to 404 */}
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
