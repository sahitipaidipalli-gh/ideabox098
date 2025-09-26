import { useState } from "react";
import { IdeaDashboard } from "@/components/IdeaDashboard";
import { IdeaSubmissionForm } from "@/components/IdeaSubmissionForm";
import { useVotingSystem } from "@/hooks/useVotingSystem";
import { type Idea } from "@/components/IdeaCard";
import { Button } from "@/components/ui/button";
import { Lightbulb, Github, Twitter } from "lucide-react";

// Mock data for demonstration
const mockIdeas: Idea[] = [
  {
    id: "1",
    title: "Dark Mode Toggle",
    description: "Add a dark mode option to improve user experience during night time usage. This would help reduce eye strain and provide better accessibility.",
    category: "User Interface",
    usageFrequency: "High",
    status: "Development In Progress",
    votes: 24,
    submittedBy: "Sarah Chen",
    submittedAt: "2024-01-15T10:30:00Z",
    notes: "Development started. Expected completion in Q2 2024."
  },
  {
    id: "2", 
    title: "Real-time Collaboration",
    description: "Enable multiple users to work on the same document simultaneously with live cursor tracking and change highlighting.",
    category: "New Feature",
    usageFrequency: "High",
    status: "Planned in Q4",
    votes: 18,
    submittedBy: "Marcus Johnson",
    submittedAt: "2024-01-12T14:20:00Z",
    notes: "High priority feature. Architecture planning in progress."
  },
  {
    id: "3",
    title: "Mobile App Performance",
    description: "Optimize the mobile application to reduce loading times and improve responsiveness on older devices.",
    category: "Performance",
    usageFrequency: "High",
    status: "Released",
    votes: 31,
    submittedBy: "Elena Rodriguez", 
    submittedAt: "2023-12-08T09:15:00Z",
    notes: "Completed! App performance improved by 40% on average."
  },
  {
    id: "4",
    title: "Advanced Search Filters",
    description: "Add more granular search filters including date ranges, custom tags, and advanced boolean operations.",
    category: "User Interface",
    usageFrequency: "Low",
    status: "Under Review",
    votes: 12,
    submittedBy: "David Kim",
    submittedAt: "2024-01-18T16:45:00Z"
  },
  {
    id: "5",
    title: "API Rate Limiting",
    description: "Implement intelligent rate limiting to prevent abuse while maintaining good user experience for legitimate usage.",
    category: "Security",
    usageFrequency: "Low", 
    status: "Will be revisited later",
    votes: 8,
    submittedBy: "Alex Thompson",
    submittedAt: "2024-01-10T11:30:00Z",
    notes: "Lower priority. Will revisit after core features are completed."
  }
];

const Index = () => {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const { votedIdeas, remainingVotes, voteForIdea, getQuarterInfo } = useVotingSystem();

  const handleSubmitIdea = (newIdeaData: Omit<Idea, "id" | "votes" | "submittedAt" | "status">) => {
    const newIdea: Idea = {
      ...newIdeaData,
      id: Date.now().toString(),
      votes: 1, // Auto-vote for your own idea
      submittedAt: new Date().toISOString(),
      status: "Under Review"
    };

    setIdeas(prevIdeas => [newIdea, ...prevIdeas]);
    
    // Auto-vote for your own submission
    setTimeout(() => {
      voteForIdea(newIdea.id);
    }, 100);
  };

  const handleVoteForIdea = (ideaId: string) => {
    const success = voteForIdea(ideaId);
    if (success) {
      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === ideaId
            ? { ...idea, votes: idea.votes + 1 }
            : idea
        )
      );
    }
  };

  const quarterInfo = getQuarterInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Idea Box</h1>
                <p className="text-xs text-muted-foreground">
                  {quarterInfo.currentQuarter} • {remainingVotes}/{quarterInfo.totalVotes} votes left
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsSubmissionFormOpen(true)}
                size="sm"
                className="bg-primary hover:bg-primary-dark"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Submit Idea
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <IdeaDashboard
          ideas={ideas}
          onVoteForIdea={handleVoteForIdea}
          votedIdeas={votedIdeas}
          remainingVotes={remainingVotes}
          onOpenSubmissionForm={() => setIsSubmissionFormOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Idea Box</p>
                <p className="text-sm text-muted-foreground">Community-driven innovation</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={() => setIsSubmissionFormOpen(true)}
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Submit an Idea
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Have a great idea? Share it with our community!
              </p>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <p className="text-sm">© 2024 Idea Box</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Submission Form Modal */}
      <IdeaSubmissionForm
        isOpen={isSubmissionFormOpen}
        onClose={() => setIsSubmissionFormOpen(false)}
        onSubmit={handleSubmitIdea}
      />
    </div>
  );
};

export default Index;