import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, Clock, User, Tag } from "lucide-react";
import { useState } from "react";

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  usageFrequency: "High" | "Low";
  status: "Under Review" | "Planned in Q4" | "Development In Progress" | "Released" | "Will be revisited later";
  votes: number;
  submittedBy: string;
  submittedAt: string;
  notes?: string;
}

interface IdeaCardProps {
  idea: Idea;
  onVote: (ideaId: string) => void;
  hasVotedFor: boolean;
  remainingVotes: number;
}

const statusConfig = {
  "Under Review": { color: "bg-status-review text-white", icon: "🔍" },
  "Planned in Q4": { color: "bg-status-planned text-white", icon: "📅" },
  "Development In Progress": { color: "bg-status-progress text-white", icon: "⚡" },
  "Released": { color: "bg-status-released text-white", icon: "✅" },
  "Will be revisited later": { color: "bg-status-revisit text-white", icon: "🔄" }
};

export function IdeaCard({ idea, onVote, hasVotedFor, remainingVotes }: IdeaCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const statusStyle = statusConfig[idea.status];

  const handleVote = async () => {
    if (hasVotedFor || remainingVotes <= 0) return;
    
    setIsVoting(true);
    setTimeout(() => {
      onVote(idea.id);
      setIsVoting(false);
    }, 300);
  };

  return (
    <Card className="idea-card group relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {idea.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
              {idea.description}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVote}
            disabled={hasVotedFor || remainingVotes <= 0 || isVoting}
            className={`vote-button flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-[60px] ${
              hasVotedFor 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'hover:bg-primary/10 hover:border-primary/50'
            }`}
          >
            <ArrowUp className={`h-4 w-4 ${isVoting ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-medium">{idea.votes}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={`status-badge ${statusStyle.color}`}>
            <span className="mr-1">{statusStyle.icon}</span>
            {idea.status}
          </Badge>
          
          <Badge variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {idea.category}
          </Badge>
          
          <Badge variant={idea.usageFrequency === "High" ? "default" : "secondary"} className="text-xs">
            {idea.usageFrequency} Frequency
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{idea.submittedBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(idea.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {idea.notes && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">{idea.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}