import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import SearchModal from "./SearchModal";
import { useAuth } from "@/lib/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuth, signOut } from "firebase/auth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleCategories = () => setCategoriesOpen(!categoriesOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <header className="sticky top-0 bg-white shadow-md z-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary font-bold text-2xl">Labarin<span className="text-secondary">Tech</span></span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={`font-medium hover:text-primary ${isActive("/") ? "text-primary" : ""}`}>
              Home
            </Link>
            <div className="relative group">
              <button className="font-medium hover:text-primary flex items-center">
                Categories <i className="ri-arrow-down-s-line ml-1"></i>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-20 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition duration-200 invisible group-hover:visible">
                <Link href="/category/programming" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Programming</Link>
                <Link href="/category/ai" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Artificial Intelligence</Link>
                <Link href="/category/mobile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Mobile Tech</Link>
                <Link href="/category/hardware" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Hardware</Link>
                <Link href="/category/startups" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Startups</Link>
              </div>
            </div>
            <Link href="/about" className={`font-medium hover:text-primary ${isActive("/about") ? "text-primary" : ""}`}>
              About
            </Link>
            <Link href="/contact" className={`font-medium hover:text-primary ${isActive("/contact") ? "text-primary" : ""}`}>
              Contact
            </Link>
          </nav>
          
          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleSearch} className="text-xl hover:text-primary">
              <i className="ri-search-line"></i>
            </button>
            <button onClick={toggleMobileMenu} className="text-xl md:hidden hover:text-primary">
              <i className={mobileMenuOpen ? "ri-close-line" : "ri-menu-line"}></i>
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback>{getInitials(user.displayName || user.email || "User")}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/articles" className="cursor-pointer">Articles</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/editor" className="cursor-pointer">New Article</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/admin/login" className="hidden md:flex">
                <Button variant="default" className="flex items-center space-x-1">
                  <i className="ri-dashboard-line"></i>
                  <span>Dashboard</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="font-medium">Home</Link>
              <div className="relative">
                <button onClick={toggleCategories} className="font-medium flex items-center justify-between w-full">
                  Categories <i className={`ri-arrow-${categoriesOpen ? 'up' : 'down'}-s-line`}></i>
                </button>
                {categoriesOpen && (
                  <div className="mt-2 pl-4 space-y-2">
                    <Link href="/category/programming" className="block py-1">Programming</Link>
                    <Link href="/category/ai" className="block py-1">Artificial Intelligence</Link>
                    <Link href="/category/mobile" className="block py-1">Mobile Tech</Link>
                    <Link href="/category/hardware" className="block py-1">Hardware</Link>
                    <Link href="/category/startups" className="block py-1">Startups</Link>
                  </div>
                )}
              </div>
              <Link href="/about" className="font-medium">About</Link>
              <Link href="/contact" className="font-medium">Contact</Link>
              {!user && (
                <Link href="/admin/login" className="w-full">
                  <Button variant="default" className="flex items-center space-x-1 w-full justify-center">
                    <i className="ri-dashboard-line"></i>
                    <span>Dashboard</span>
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
        
        {/* Search Modal */}
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </header>
  );
}
