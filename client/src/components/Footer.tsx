import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await subscribeToNewsletter(email);
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-white font-bold text-2xl">Labarin<span className="text-secondary">Tech</span></span>
            </Link>
            <p className="text-gray-400 mb-4">Northern Nigeria's leading tech magazine, delivering insightful news, tutorials, and analysis to keep you informed and inspired.</p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="https://facebook.com" className="text-gray-400 hover:text-white transition">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/category/programming" className="text-gray-400 hover:text-white transition">Programming</Link></li>
              <li><Link href="/category/ai" className="text-gray-400 hover:text-white transition">Artificial Intelligence</Link></li>
              <li><Link href="/category/mobile" className="text-gray-400 hover:text-white transition">Mobile Technology</Link></li>
              <li><Link href="/category/hardware" className="text-gray-400 hover:text-white transition">Hardware Reviews</Link></li>
              <li><Link href="/category/startups" className="text-gray-400 hover:text-white transition">Startups & Funding</Link></li>
              <li><Link href="/category/education" className="text-gray-400 hover:text-white transition">Education & Training</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link href="/write-for-us" className="text-gray-400 hover:text-white transition">Write for Us</Link></li>
              <li><Link href="/advertise" className="text-gray-400 hover:text-white transition">Advertise</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest tech updates from Northern Nigeria.</p>
            <form className="mb-4" onSubmit={handleSubscribe}>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Your Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-800 border-gray-700 text-white"
                />
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  {submitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </form>
            <p className="text-gray-400 text-sm">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} LabarinTech. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
