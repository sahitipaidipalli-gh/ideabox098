import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type IdeaWithVotes } from "@/lib/supabase";
import { ArrowUp, Clock, User, Tag, Calendar, MessageSquare } from "lucide-react";

interface IdeaDetailsDialogProps {
  idea: IdeaWithVotes | null;
  isOpen: boolean;
  onClose: () => void;
  onVote?: (ideaId: string) => void;
  onUnvote?: (ideaId: string) => void;
  hasVoted?: boolean;
  remainingVotes?: number;
}

const statusConfig = {
  "Under Review": { color: "bg-status-review text-white", icon: "🔍" },
  "Planned in Q4": { color: "bg-status-planned text-white", icon: "📅" },
  "Development In Progress": { color: "bg-status-progress text-white", icon: "⚡" },
  "Released": { color: "bg-status-released text-white", icon: "✅" },
  "Will be revisited later": { color: "bg-status-revisit text-white", icon: "🔄" }
};

export function IdeaDetailsDialog({ 
  idea, 
  isOpen, 
  onClose, 
  onVote, 
  onUnvote, 
  hasVoted = false,
  remainingVotes = 0 
}: IdeaDetailsDialogProps) {
  if (!idea) return null;

  const statusStyle = statusConfig[idea.status];

  const handleVoteClick = () => {
    if (hasVoted && onUnvote) {
      onUnvote(idea.id);
    } else if (!hasVoted && onVote) {
      onVote(idea.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{idea.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Category */}
          <div className="flex flex-wrap gap-3">
            <Badge className={`status-badge ${statusStyle.color}`}>
              {idea.status}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Tag className="h-3 w-3" />
              {idea.category}
            </Badge>
            <Badge variant={idea.usage_frequency === "High" ? "default" : "secondary"}>
              Usage: {idea.usage_frequency}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">{idea.description}</p>
          </div>

          {/* Notes */}
          {idea.notes && (
            <div>
              <h3 className="font-semibold mb-2">Admin Notes</h3>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{idea.notes}</p>
              </div>
            </div>
          )}

          {/* Submission Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Submitted By
              </h3>
              <p className="text-sm">{idea.submitted_by || 'Anonymous'}</p>
              {idea.submitted_by_company && (
                <p className="text-xs text-muted-foreground">{idea.submitted_by_company}</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Submitted On
              </h3>
              <p className="text-sm">{new Date(idea.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </div>

          {/* Voting Section */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <ArrowUp className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{idea.votes}</span>
                <span className="text-xs text-muted-foreground">votes</span>
              </div>
            </div>
            
            {onVote && onUnvote && (
              <Button
                onClick={handleVoteClick}
                disabled={!hasVoted && remainingVotes <= 0}
                className={hasVoted 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : ''}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                {hasVoted ? 'Remove Vote' : 'Vote for this Idea'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
