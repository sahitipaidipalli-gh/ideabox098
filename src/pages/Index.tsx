import { useState } from "react";
import { IdeaDashboard } from "@/components/IdeaDashboard";
import { IdeaSubmissionFormTab } from "@/components/IdeaSubmissionFormTab";
import { useIdeas } from "@/hooks/useIdeas";
import { useVoting } from "@/hooks/useVoting";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Github, Twitter, Plus, List } from "lucide-react";

// Remove the mock data as we're now using real Supabase data

const Index = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const { user } = useAuth();
  const { ideas, loading: ideasLoading, submitIdea, refetch } = useIdeas();
  const { 
    remainingVotes, 
    userVotes, 
    loading: votingLoading, 
    voteForIdea, 
    unvoteForIdea, 
    getQuarterInfo 
  } = useVoting();

  const handleSubmitIdea = async (ideaData: {
    title: string;
    description: string;
    category: string;
    usage_frequency: 'High' | 'Low';
  }) => {
    await submitIdea({
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.category,
      usageFrequency: ideaData.usage_frequency,
    });
  };

  const handleVoteForIdea = async (ideaId: string) => {
    const result = await voteForIdea(ideaId);
    await refetch();
    return result;
  };

  const handleUnvoteForIdea = async (ideaId: string) => {
    const result = await unvoteForIdea(ideaId);
    await refetch();
    return result;
  };

  const quarterInfo = getQuarterInfo();

  if (ideasLoading || votingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ideas...</p>
        </div>
      </div>
    );
  }

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
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome, {user?.email || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              onUnvoteForIdea={handleUnvoteForIdea}
              votedIdeas={new Set(userVotes)}
              remainingVotes={remainingVotes}
              onOpenSubmissionForm={() => setActiveTab("submit")}
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