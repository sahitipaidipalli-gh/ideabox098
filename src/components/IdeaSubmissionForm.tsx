import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lightbulb, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IdeaSubmissionFormProps {
  onSubmit: (idea: Omit<import("./IdeaCard").Idea, "id" | "votes" | "submittedAt" | "status">) => void;
  onClose: () => void;
  isOpen: boolean;
}

const categories = [
  "User Interface",
  "Performance", 
  "Security",
  "Integration",
  "Analytics",
  "Mobile Experience",
  "New Feature",
  "Other"
];

export function IdeaSubmissionForm({ onSubmit, onClose, isOpen }: IdeaSubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    usageFrequency: "High" as "High" | "Low",
    submittedBy: "John Doe" // In real app, this would come from auth
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(formData);
      toast({
        title: "Idea Submitted! 💡",
        description: "Thank you for your suggestion. We'll review it and get back to you.",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        usageFrequency: "High",
        submittedBy: "John Doe"
      });
      
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Submit Your Idea</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Share your innovative ideas to help us improve our product. Your feedback drives our development!
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Idea Title *
              </Label>
              <Input
                id="title"
                placeholder="Brief, descriptive title for your idea"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Which area does your idea relate to?" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Usage Frequency</Label>
              <RadioGroup
                value={formData.usageFrequency}
                onValueChange={(value: "High" | "Low") => setFormData({ ...formData, usageFrequency: value })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="High" id="high" className="text-primary" />
                  <Label htmlFor="high" className="text-sm cursor-pointer">
                    High - I would use this frequently
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Low" id="low" className="text-primary" />
                  <Label htmlFor="low" className="text-sm cursor-pointer">
                    Low - I would use this occasionally
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary-dark transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Idea
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}