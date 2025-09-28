import { useState } from "react";
import { IdeaDashboard } from "@/components/IdeaDashboard";
import { IdeaSubmissionFormTab } from "@/components/IdeaSubmissionFormTab";
import { useVotingSystem } from "@/hooks/useVotingSystem";
import { type IdeaWithVotes } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Github, Twitter, Plus, List, Sparkles } from "lucide-react";

// Mock data for demonstration  
const mockIdeas: IdeaWithVotes[] = [
  {
    id: "1",
    title: "Dark Mode Toggle",
    description: "Add a dark mode option to improve user experience during night time usage. This would help reduce eye strain and provide better accessibility.",
    category: "User Interface",
    usage_frequency: "High",
    status: "Development In Progress",
    votes: 24,
    submitted_by: "Sarah Chen",
    submitted_by_company: "Tech Corp",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    created_by: "user1",
    voters: [],
    notes: "Development started. Expected completion in Q2 2024."
  },
  {
    id: "2", 
    title: "Real-time Collaboration",
    description: "Enable multiple users to work on the same document simultaneously with live cursor tracking and change highlighting.",
    category: "New Feature",
    usage_frequency: "High",
    status: "Planned in Q4",
    votes: 18,
    submitted_by: "Marcus Johnson",
    submitted_by_company: "StartupXYZ",
    created_at: "2024-01-12T14:20:00Z",
    updated_at: "2024-01-12T14:20:00Z",
    created_by: "user2",
    voters: [],
    notes: "High priority feature. Architecture planning in progress."
  },
  {
    id: "3",
    title: "Mobile App Performance",
    description: "Optimize the mobile application to reduce loading times and improve responsiveness on older devices.",
    category: "Performance",
    usage_frequency: "High",
    status: "Released",
    votes: 31,
    submitted_by: "Elena Rodriguez",
    submitted_by_company: "Mobile Inc", 
    created_at: "2023-12-08T09:15:00Z",
    updated_at: "2023-12-08T09:15:00Z",
    created_by: "user3",
    voters: [],
    notes: "Completed! App performance improved by 40% on average."
  },
  {
    id: "4",
    title: "Advanced Search Filters",
    description: "Add more granular search filters including date ranges, custom tags, and advanced boolean operations.",
    category: "User Interface",
    usage_frequency: "Low",
    status: "Under Review",
    votes: 12,
    submitted_by: "David Kim",
    submitted_by_company: "SearchCo",
    created_at: "2024-01-18T16:45:00Z",
    updated_at: "2024-01-18T16:45:00Z",
    created_by: "user4",
    voters: [],
    notes: null
  },
  {
    id: "5",
    title: "API Rate Limiting",
    description: "Implement intelligent rate limiting to prevent abuse while maintaining good user experience for legitimate usage.",
    category: "Security",
    usage_frequency: "Low", 
    status: "Will be revisited later",
    votes: 8,
    submitted_by: "Alex Thompson",
    submitted_by_company: "SecureTech",
    created_at: "2024-01-10T11:30:00Z",
    updated_at: "2024-01-10T11:30:00Z",
    created_by: "user5",
    voters: [],
    notes: "Lower priority. Will revisit after core features are completed."
  },
  {
    id: "6",
    title: "Single Sign-On Integration",
    description: "Add support for SSO providers like Google, Microsoft, and Okta to streamline user authentication for enterprise customers.",
    category: "Security",
    usage_frequency: "High",
    status: "Development In Progress",
    votes: 29,
    submitted_by: "Jennifer Walsh",
    submitted_by_company: "Enterprise Corp",
    created_at: "2024-01-20T09:15:00Z",
    updated_at: "2024-01-20T09:15:00Z",
    created_by: "user6",
    voters: [],
    notes: "Integration with Google and Microsoft completed. Okta support in progress."
  },
  {
    id: "7",
    title: "Bulk Data Export",
    description: "Allow users to export large datasets in various formats (CSV, JSON, Excel) with progress tracking and email notifications.",
    category: "Analytics",
    usage_frequency: "High",
    status: "Released",
    votes: 22,
    submitted_by: "Robert Kim",
    submitted_by_company: "DataFlow Inc",
    created_at: "2023-11-30T14:22:00Z",
    updated_at: "2023-11-30T14:22:00Z",
    created_by: "user7",
    voters: [],
    notes: "Successfully released with support for CSV, JSON, and Excel formats."
  },
  {
    id: "8",
    title: "Keyboard Shortcuts",
    description: "Implement comprehensive keyboard shortcuts for power users to navigate and perform actions more efficiently.",
    category: "User Interface",
    usage_frequency: "Low",
    status: "Under Review",
    votes: 15,
    submitted_by: "Lisa Park",
    submitted_by_company: "UX Studio",
    created_at: "2024-01-22T11:45:00Z",
    updated_at: "2024-01-22T11:45:00Z",
    created_by: "user8",
    voters: [],
    notes: "UX team reviewing shortcut patterns and accessibility implications."
  },
  {
    id: "9",
    title: "Webhook Integration",
    description: "Add webhook support to allow real-time notifications to external systems when certain events occur in the platform.",
    category: "Integration",
    usage_frequency: "Low",
    status: "Planned in Q4",
    votes: 14,
    submitted_by: "Michael Torres",
    submitted_by_company: "IntegrationHub",
    created_at: "2024-01-05T16:30:00Z",
    updated_at: "2024-01-05T16:30:00Z",
    created_by: "user9",
    voters: [],
    notes: "Approved for Q4 roadmap. Technical specification in draft phase."
  },
  {
    id: "10",
    title: "Offline Mode Support",
    description: "Enable core functionality to work offline with automatic sync when connection is restored, especially useful for mobile users.",
    category: "Mobile Experience",
    usage_frequency: "High",
    status: "Will be revisited later",
    votes: 35,
    submitted_by: "Anna Schmidt",
    submitted_by_company: "MobileFirst",
    created_at: "2023-12-15T13:20:00Z",
    updated_at: "2023-12-15T13:20:00Z",
    created_by: "user10",
    voters: [],
    notes: "High vote count noted. Requires significant architecture changes - will revisit in 2025."
  },
  {
    id: "11",
    title: "Custom Dashboard Widgets",
    description: "Allow users to create and customize dashboard widgets with drag-and-drop functionality and real-time data visualization.",
    category: "Analytics",
    usage_frequency: "High",
    status: "Development In Progress",
    votes: 27,
    submitted_by: "James Wilson",
    submitted_by_company: "DashTech",
    created_at: "2024-01-08T10:12:00Z",
    updated_at: "2024-01-08T10:12:00Z",
    created_by: "user11",
    voters: [],
    notes: "Frontend components completed. Backend API integration in progress."
  },
  {
    id: "12",
    title: "Two-Factor Authentication",
    description: "Implement 2FA support with SMS, email, and authenticator app options to enhance account security.",
    category: "Security",
    usage_frequency: "High",
    status: "Released",
    votes: 41,
    submitted_by: "Maria Gonzalez",
    submitted_by_company: "SecureAuth",
    created_at: "2023-10-25T15:45:00Z",
    updated_at: "2023-10-25T15:45:00Z",
    created_by: "user12",
    voters: [],
    notes: "Fully implemented with support for SMS, email, and TOTP authenticator apps."
  },
  {
    id: "13",
    title: "Team Collaboration Spaces",
    description: "Create dedicated spaces where team members can collaborate on projects with shared resources and communication tools.",
    category: "New Feature",
    usage_frequency: "High",
    status: "Planned in Q4",
    votes: 33,
    submitted_by: "Chris Anderson",
    submitted_by_company: "TeamWork LLC",
    created_at: "2024-01-25T12:30:00Z",
    updated_at: "2024-01-25T12:30:00Z",
    created_by: "user13",
    voters: [],
    notes: "Feature approved for Q4. User research completed, design phase starting soon."
  },
  {
    id: "14",
    title: "Performance Analytics Dashboard",
    description: "Provide detailed analytics on application performance, user behavior, and system metrics for administrators.",
    category: "Analytics",
    usage_frequency: "Low",
    status: "Under Review",
    votes: 11,
    submitted_by: "Patricia Lee",
    submitted_by_company: "Analytics Pro",
    created_at: "2024-01-28T08:55:00Z",
    updated_at: "2024-01-28T08:55:00Z",
    created_by: "user14",
    voters: [],
    notes: "Product team evaluating requirements and scope. May combine with existing analytics features."
  },
  {
    id: "15",
    title: "Voice Commands",
    description: "Add voice command support for accessibility and hands-free operation using modern speech recognition APIs.",
    category: "User Interface",
    usage_frequency: "Low",
    status: "Will be revisited later",
    votes: 9,
    submitted_by: "Daniel Brown",
    submitted_by_company: "VoiceUI Inc",
    created_at: "2024-01-02T17:20:00Z",
    updated_at: "2024-01-02T17:20:00Z",
    created_by: "user15",
    voters: [],
    notes: "Interesting concept but requires extensive accessibility testing. Will revisit when resources allow."
  }
];

const Index = () => {
  const [ideas, setIdeas] = useState<IdeaWithVotes[]>(mockIdeas);
  const { votedIdeas, remainingVotes, voteForIdea, getQuarterInfo } = useVotingSystem();

  const handleSubmitIdea = (newIdeaData: Omit<IdeaWithVotes, "id" | "votes" | "created_at" | "status">) => {
    const newIdea: IdeaWithVotes = {
      ...newIdeaData,
      id: Date.now().toString(),
      votes: 1, // Auto-vote for your own idea
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "mock-user-id",
      status: "Under Review",
      voters: [],
      submitted_by: null,
      submitted_by_company: null,
      notes: null
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
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{quarterInfo.currentQuarter}</span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    <div className={`w-2 h-2 rounded-full ${remainingVotes > 2 ? 'bg-green-500' : remainingVotes > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${remainingVotes > 2 ? 'text-green-700' : remainingVotes > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                      {remainingVotes} votes left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="submit" className="flex items-center gap-2 bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plus className="h-4 w-4" />
              Submit Your Idea
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              View Other Ideas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="submit" className="mt-0 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Share Your Innovation
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your ideas drive our product forward. Submit your suggestion and help shape the future of our platform.
              </p>
            </div>
            <IdeaSubmissionFormTab onSubmit={handleSubmitIdea} />
          </TabsContent>
          
          <TabsContent value="ideas" className="mt-0 animate-fade-in">
            <IdeaDashboard
              ideas={ideas}
              onVoteForIdea={handleVoteForIdea}
              votedIdeas={votedIdeas}
              remainingVotes={remainingVotes}
              onOpenSubmissionForm={() => {}}
            />
          </TabsContent>
        </Tabs>
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
              <p className="text-sm font-medium">💡 Innovation Starts Here</p>
              <p className="text-xs text-muted-foreground text-center">
                Every great feature began as someone's idea - yours could be next!
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

    </div>
  );
};

export default Index;