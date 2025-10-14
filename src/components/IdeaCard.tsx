import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Clock, User, Tag, Users } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type IdeaWithVotes } from "@/lib/supabase";

interface IdeaCardProps {
  idea: IdeaWithVotes;
  onVote: (ideaId: string) => Promise<boolean>;
  onUnvote: (ideaId: string) => Promise<boolean>;
  hasVotedFor: boolean;
  remainingVotes: number;
}

const statusConfig = {
  "Under Review": { color: "bg-status-review text-white", icon: "🔍" },
  "Planned": { color: "bg-status-planned text-white", icon: "📅" },
  "Development In Progress": { color: "bg-status-progress text-white", icon: "⚡" },
  "Released": { color: "bg-status-released text-white", icon: "✅" },
  "Will be revisited later": { color: "bg-status-revisit text-white", icon: "🔄" }
};

export function IdeaCard({ idea, onVote, onUnvote, hasVotedFor, remainingVotes }: IdeaCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const statusStyle = statusConfig[idea.status];

  const handleVote = async () => {
    setIsVoting(true);
    const success = await onVote(idea.id);
    setIsVoting(false);
  };

  const handleUnvote = async () => {
    setIsVoting(true);
    const success = await onUnvote(idea.id);
    setIsVoting(false);
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
          
          <div className="flex flex-col items-center gap-1">
            {hasVotedFor ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnvote}
                disabled={isVoting}
                className="vote-button flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-[60px] bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              >
                <ArrowDown className={`h-4 w-4 ${isVoting ? 'animate-bounce' : ''}`} />
                <span className="text-xs font-medium">{idea.votes}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVote}
                disabled={remainingVotes <= 0 || isVoting}
                className="vote-button flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-[60px] hover:bg-primary/10 hover:border-primary/50"
              >
                <ArrowUp className={`h-4 w-4 ${isVoting ? 'animate-bounce' : ''}`} />
                <span className="text-xs font-medium">{idea.votes}</span>
              </Button>
            )}
            
            {idea.voters && idea.voters.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {idea.voters.length}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Voted by:</h4>
                    <div className="space-y-1">
                      {idea.voters.map((voter, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          <span className="font-medium">{voter.full_name || 'Anonymous'}</span>
                          {voter.company_name && (
                            <span className="text-muted-foreground/80"> • {voter.company_name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
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
          
          <Badge variant={idea.usage_frequency === "High" ? "default" : "secondary"} className="text-xs">
            {idea.usage_frequency} Frequency
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <div className="flex flex-col">
              <span>{idea.submitted_by || 'Anonymous'}</span>
              {idea.submitted_by_company && (
                <span className="text-muted-foreground/80">{idea.submitted_by_company}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
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