import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { useAuth } from "@/lib/authContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  useEffect(() => {
    // Redirect if already logged in
    if (!loading && user) {
      navigate("/admin");
    }
  }, [user, loading, navigate]);
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (isSignUp && !name) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive"
      });
      return;
    }
    
    if (isSignUp && password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isSignUp) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
      } else {
        // Sign in with existing account
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Redirect to dashboard
      navigate("/admin");
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithPopup(auth, googleProvider);
      
      // Redirect to dashboard
      navigate("/admin");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create an Account" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Join LabarinTech as a content creator" 
                : "Access your LabarinTech dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailAuth}>
              {isSignUp && (
                <div className="mb-4">
                  <Label htmlFor="name" className="block mb-2">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <Label htmlFor="email" className="block mb-2">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="password" className="block mb-2">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  <>{isSignUp ? "Create Account" : "Sign In"}</>
                )}
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <i className="ri-google-fill text-lg mr-2"></i>
                  Sign in with Google
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isSubmitting}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
