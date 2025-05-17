import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { 
  db, 
  storage, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  collection, 
  Timestamp, 
  serverTimestamp,
  uploadImage,
  ARTICLE_STATES 
} from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { slugify, formatDate } from "@/lib/utils";
import RichTextEditor from "@/components/editor/RichTextEditor";

export default function Editor() {
  const [match, params] = useRoute("/admin/editor/:id?");
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Article data
  const [articleId, setArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState(ARTICLE_STATES.DRAFT);
  const [featuredImage, setFeaturedImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");
  const [publishType, setPublishType] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  
  // Load article data
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate("/admin/login");
      return;
    }
    
    if (user && params?.id) {
      loadArticle(params.id);
    } else {
      setLoading(false);
    }
  }, [user, authLoading, params]);
  
  const loadArticle = async (id: string) => {
    try {
      setLoading(true);
      
      const articleDoc = await getDoc(doc(db, "articles", id));
      if (!articleDoc.exists()) {
        toast({
          title: "Article not found",
          description: "The article you're trying to edit doesn't exist.",
          variant: "destructive"
        });
        navigate("/admin/articles");
        return;
      }
      
      const articleData = articleDoc.data();
      
      // Check if current user is the author
      if (articleData.authorId !== user.uid) {
        toast({
          title: "Permission denied",
          description: "You don't have permission to edit this article.",
          variant: "destructive"
        });
        navigate("/admin/articles");
        return;
      }
      
      setArticleId(id);
      setTitle(articleData.title || "");
      setSlug(articleData.slug || "");
      setExcerpt(articleData.excerpt || "");
      setContent(articleData.content || "");
      setState(articleData.state || ARTICLE_STATES.DRAFT);
      setFeaturedImage(articleData.featuredImage || "");
      setCategories(articleData.categories || []);
      setTags(articleData.tags ? articleData.tags.join(", ") : "");
      setFeatured(articleData.featured || false);
      setMetaDescription(articleData.metaDescription || "");
      
      // Handle scheduled publishing
      if (articleData.scheduledPublish && articleData.state === ARTICLE_STATES.SCHEDULED) {
        setPublishType("schedule");
        const scheduledTime = articleData.scheduledPublish.toDate();
        setScheduledDate(scheduledTime.toISOString().substring(0, 16));
      } else {
        setPublishType("now");
      }
      
      // Set last saved time
      if (articleData.updatedAt) {
        setLastSaved(articleData.updatedAt.toDate());
      } else if (articleData.createdAt) {
        setLastSaved(articleData.createdAt.toDate());
      }
    } catch (error) {
      console.error("Error loading article:", error);
      toast({
        title: "Error",
        description: "Failed to load article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto-generate slug if it hasn't been manually edited
    if (!articleId) {
      setSlug(slugify(newTitle));
    }
  };
  
  const handleContentUpdate = (html: string) => {
    setContent(html);
    // Auto-save after a delay
    saveArticle("draft");
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);
    
    try {
      const path = `images/${Date.now()}_${file.name}`;
      const imageUrl = await uploadImage(file, path);
      setFeaturedImage(imageUrl as string);
      
      toast({
        title: "Image uploaded",
        description: "Featured image has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleCategoryToggle = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };
  
  const validateArticle = (state: string): boolean => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your article.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your article.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!slug.trim()) {
      toast({
        title: "Slug required",
        description: "Please provide a URL slug for your article.",
        variant: "destructive"
      });
      return false;
    }
    
    if (categories.length === 0) {
      toast({
        title: "Category required",
        description: "Please select at least one category.",
        variant: "destructive"
      });
      return false;
    }
    
    if (state === ARTICLE_STATES.SCHEDULED && publishType === "schedule" && !scheduledDate) {
      toast({
        title: "Schedule date required",
        description: "Please select a date and time to schedule the article.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const saveArticle = async (saveType: "draft" | "submit" | "publish" | "schedule") => {
    // Don't validate for auto-saves as a draft
    if (saveType !== "draft" && !validateArticle(saveType)) {
      return;
    }
    
    try {
      setSaving(true);
      
      let newState = state;
      if (saveType === "submit") {
        newState = ARTICLE_STATES.PENDING_REVIEW;
      } else if (saveType === "publish") {
        newState = ARTICLE_STATES.PUBLISHED;
      } else if (saveType === "schedule") {
        newState = ARTICLE_STATES.SCHEDULED;
      }
      
      // Prepare article data
      const articleData: any = {
        title,
        slug,
        excerpt,
        content,
        state: newState,
        featuredImage,
        categories,
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        featured,
        metaDescription,
        updatedAt: serverTimestamp()
      };
      
      // Handle publishing or scheduling
      if (saveType === "publish") {
        articleData.publishedAt = serverTimestamp();
      } else if (saveType === "schedule" && scheduledDate) {
        const scheduledTime = new Date(scheduledDate);
        articleData.scheduledPublish = Timestamp.fromDate(scheduledTime);
      }
      
      if (articleId) {
        // Update existing article
        await updateDoc(doc(db, "articles", articleId), articleData);
        
        toast({
          title: "Article saved",
          description: `Your article has been ${
            saveType === "draft" ? "saved as a draft" : 
            saveType === "submit" ? "submitted for review" : 
            saveType === "publish" ? "published" : 
            "scheduled for publication"
          }.`
        });
      } else {
        // Create new article
        articleData.authorId = user.uid;
        articleData.createdAt = serverTimestamp();
        
        const docRef = await addDoc(collection(db, "articles"), articleData);
        setArticleId(docRef.id);
        
        toast({
          title: "Article created",
          description: `Your article has been ${
            saveType === "draft" ? "saved as a draft" : 
            saveType === "submit" ? "submitted for review" : 
            saveType === "publish" ? "published" : 
            "scheduled for publication"
          }.`
        });
      }
      
      // Update state to reflect the new status
      setState(newState);
      setLastSaved(new Date());
      
      // Redirect if publishing or submitting
      if (saveType === "publish" || saveType === "submit" || saveType === "schedule") {
        navigate("/admin/articles");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {articleId ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-gray-600">
              {articleId ? "Make changes to your article" : "Write and publish a new article"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/articles')}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => saveArticle("draft")}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i> Saving...
                </>
              ) : (
                <>Save Draft</>
              )}
            </Button>
            {state === ARTICLE_STATES.DRAFT && (
              <Button
                variant="secondary"
                onClick={() => saveArticle("submit")}
                disabled={saving}
              >
                Submit for Review
              </Button>
            )}
            {(state === ARTICLE_STATES.DRAFT || state === ARTICLE_STATES.PENDING_REVIEW) && (
              <Button
                onClick={() => saveArticle(publishType === "schedule" ? "schedule" : "publish")}
                disabled={saving}
              >
                {publishType === "schedule" ? "Schedule" : "Publish"}
              </Button>
            )}
          </div>
        </div>
        
        {/* Article Editor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter article title"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="slug" className="block text-gray-700 font-medium mb-2">Slug/Permalink</Label>
                  <Input
                    id="slug"
                    placeholder="article-slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL: labarintech.com/article/{slug}</p>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="excerpt" className="block text-gray-700 font-medium mb-2">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Write a short excerpt for this article"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full h-24"
                  />
                  <p className="text-xs text-gray-500 mt-1">A brief summary of the article, displayed in previews</p>
                </div>
                
                <div>
                  <Label className="block text-gray-700 font-medium mb-2">Content</Label>
                  <RichTextEditor 
                    content={content} 
                    onChange={setContent}
                    onUpdate={handleContentUpdate}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label htmlFor="metaDescription" className="block text-gray-700 font-medium mb-2">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Enter meta description"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full h-24"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters for SEO</p>
                </div>
                
                <div>
                  <Label htmlFor="tags" className="block text-gray-700 font-medium mb-2">Tags/Keywords</Label>
                  <Input
                    id="tags"
                    placeholder="Add tags separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Article Status</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>Current status:</span>
                    <span className="font-medium">{state.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  {lastSaved && (
                    <div className="text-sm text-gray-500">
                      Last saved: {formatDate(lastSaved)}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Publication Settings</h4>
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="publish-now"
                      name="publish-type"
                      checked={publishType === "now"}
                      onChange={() => setPublishType("now")}
                      className="mr-2"
                    />
                    <Label htmlFor="publish-now">Publish Now</Label>
                  </div>
                  <div className="flex items-center mb-3">
                    <input
                      type="radio"
                      id="schedule"
                      name="publish-type"
                      checked={publishType === "schedule"}
                      onChange={() => setPublishType("schedule")}
                      className="mr-2"
                    />
                    <Label htmlFor="schedule">Schedule</Label>
                  </div>
                  
                  {publishType === "schedule" && (
                    <div className="mb-3 pl-6">
                      <Label htmlFor="scheduled-date" className="block mb-1">Schedule Date & Time</Label>
                      <Input
                        type="datetime-local"
                        id="scheduled-date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().substring(0, 16)}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center mt-4">
                    <Checkbox
                      id="featured"
                      checked={featured}
                      onCheckedChange={(checked) => setFeatured(!!checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="featured">Mark as Featured Article</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="programming"
                      checked={categories.includes("Programming")}
                      onCheckedChange={() => handleCategoryToggle("Programming")}
                      className="mr-2"
                    />
                    <Label htmlFor="programming">Programming</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="mobile"
                      checked={categories.includes("Mobile")}
                      onCheckedChange={() => handleCategoryToggle("Mobile")}
                      className="mr-2"
                    />
                    <Label htmlFor="mobile">Mobile</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="ai"
                      checked={categories.includes("AI")}
                      onCheckedChange={() => handleCategoryToggle("AI")}
                      className="mr-2"
                    />
                    <Label htmlFor="ai">AI</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="hardware"
                      checked={categories.includes("Hardware")}
                      onCheckedChange={() => handleCategoryToggle("Hardware")}
                      className="mr-2"
                    />
                    <Label htmlFor="hardware">Hardware</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="startups"
                      checked={categories.includes("Startups")}
                      onCheckedChange={() => handleCategoryToggle("Startups")}
                      className="mr-2"
                    />
                    <Label htmlFor="startups">Startups</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="education"
                      checked={categories.includes("Education")}
                      onCheckedChange={() => handleCategoryToggle("Education")}
                      className="mr-2"
                    />
                    <Label htmlFor="education">Education</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Featured Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {featuredImage ? (
                    <div className="mb-3">
                      <img
                        src={featuredImage}
                        alt="Featured Image"
                        className="w-full h-auto rounded"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <i className="ri-image-add-line text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500">No image selected</p>
                    </div>
                  )}
                  <Label htmlFor="featured-image" className="block w-full">
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i> Uploading...
                        </>
                      ) : (
                        <>{featuredImage ? "Change Image" : "Upload Image"}</>
                      )}
                    </Button>
                    <Input
                      id="featured-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Recommended: 1200×630 pixels for best display</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
