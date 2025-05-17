import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { subscribeToNewsletter } from "@/lib/firebase";

export default function NewsletterSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
      await subscribeToNewsletter(email, name);
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setName("");
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
    <div className="bg-primary/10 rounded-xl p-6 md:p-10 mb-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Stay Updated with Northern Nigeria's Tech Scene</h2>
        <p className="text-gray-600 mb-6 md:text-lg">Get the latest tech news, tutorials, and insights delivered straight to your inbox.</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={handleSubmit}>
          <Input 
            type="text"
            placeholder="Your Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Input 
            type="email"
            placeholder="Your Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6"
            disabled={submitting}
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-4">By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.</p>
      </div>
    </div>
  );
}
