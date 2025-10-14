import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, Clock, User, Tag, ChevronDown, ChevronUp, Search, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { type IdeaWithVotes } from "@/lib/supabase";
import { IdeaDetailsDialog } from "./IdeaDetailsDialog";

interface IdeaTableProps {
  ideas: IdeaWithVotes[];
  onVote: (ideaId: string) => Promise<boolean | void>;
  onUnvote: (ideaId: string) => Promise<boolean | void>;
  votedIdeas: Set<string>;
  remainingVotes: number;
  onOpenSubmissionForm?: () => void;
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
}

const statusConfig = {
  "Under Review": { color: "bg-status-review text-white", icon: "🔍" },
  "Planned in Q4": { color: "bg-status-planned text-white", icon: "📅" },
  "Development In Progress": { color: "bg-status-progress text-white", icon: "⚡" },
  "Released": { color: "bg-status-released text-white", icon: "✅" },
  "Will be revisited later": { color: "bg-status-revisit text-white", icon: "🔄" }
};

export function IdeaTable({ ideas, onVote, onUnvote, votedIdeas, remainingVotes, onOpenSubmissionForm, searchTerm, statusFilter, categoryFilter }: IdeaTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [votingStates, setVotingStates] = useState<Set<string>>(new Set());
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithVotes | null>(null);

  const toggleRowExpansion = (ideaId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ideaId)) {
      newExpanded.delete(ideaId);
    } else {
      newExpanded.add(ideaId);
    }
    setExpandedRows(newExpanded);
  };

  const handleVote = async (ideaId: string) => {
    const hasVoted = votedIdeas.has(ideaId);
    
    if (hasVoted) {
      // Unvote
      setVotingStates(prev => new Set(prev).add(ideaId));
      try {
        await onUnvote(ideaId);
      } finally {
        setVotingStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(ideaId);
          return newSet;
        });
      }
    } else {
      // Vote
      if (remainingVotes <= 0) return;
      
      setVotingStates(prev => new Set(prev).add(ideaId));
      try {
        await onVote(ideaId);
      } finally {
        setVotingStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(ideaId);
          return newSet;
        });
      }
    }
  };

  return (
    <>
      <IdeaDetailsDialog
        idea={selectedIdea}
        isOpen={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onVote={handleVote}
        onUnvote={handleVote}
        hasVoted={selectedIdea ? votedIdeas.has(selectedIdea.id) : false}
        remainingVotes={remainingVotes}
      />
      
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[35%]">Idea</TableHead>
            <TableHead className="w-[10%]">Category</TableHead>
            <TableHead className="w-[13%] text-center">Status</TableHead>
            <TableHead className="w-[8%] text-center">Votes</TableHead>
            <TableHead className="w-[9%]">Frequency</TableHead>
            <TableHead className="w-[13%]">Submitted</TableHead>
            <TableHead className="w-[12%] text-center">Create Jira</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => {
            const isExpanded = expandedRows.has(idea.id);
            const hasVoted = votedIdeas.has(idea.id);
            const isVoting = votingStates.has(idea.id);
            const statusStyle = statusConfig[idea.status];

            return (
              <TableRow key={idea.id} className="group hover:bg-muted/20 transition-colors">
                <TableCell className="py-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleRowExpansion(idea.id)}
                        className="p-1 h-6 w-6 mt-0.5 flex-shrink-0"
                      >
                        {isExpanded ? 
                          <ChevronUp className="h-3 w-3" /> : 
                          <ChevronDown className="h-3 w-3" />
                        }
                      </Button>
                      <div className="min-w-0 flex-1">
                        <h3 
                          className="font-semibold text-base group-hover:text-primary transition-colors leading-tight cursor-pointer underline decoration-transparent hover:decoration-primary underline-offset-2"
                          onClick={() => setSelectedIdea(idea)}
                        >
                          {idea.title}
                        </h3>
                        <p className={`text-muted-foreground text-sm mt-1 transition-all duration-200 ${
                          isExpanded ? '' : 'line-clamp-2'
                        }`}>
                          {idea.description}
                        </p>
                        {isExpanded && idea.notes && (
                          <div className="mt-3 p-2 bg-muted/50 rounded-md">
                            <p className="text-xs text-muted-foreground">{idea.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {idea.category}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-center">
                  <Badge className={`status-badge ${statusStyle.color} text-xs`}>
                    <span className="hidden sm:inline">{idea.status}</span>
                    <span className="sm:hidden">
                      {idea.status === "Under Review" ? "Review" :
                       idea.status === "Planned in Q4" ? "Planned" :
                       idea.status === "Development In Progress" ? "Progress" :
                       idea.status === "Released" ? "Released" :
                       "Later"}
                    </span>
                  </Badge>
                </TableCell>
                
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-primary" />
                      <span className="text-lg font-bold">{idea.votes}</span>
                    </div>
                    <Button
                      variant={hasVoted ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleVote(idea.id)}
                      disabled={(!hasVoted && remainingVotes <= 0) || isVoting}
                    >
                      {isVoting ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <span className="text-xs whitespace-nowrap">
                          {hasVoted ? 'Remove Vote' : 'Vote for this Idea'}
                        </span>
                      )}
                    </Button>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant={idea.usage_frequency === "High" ? "default" : "secondary"} className="text-xs">
                    {idea.usage_frequency}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm space-y-1">
                     <div className="flex items-center gap-1 text-muted-foreground">
                       <User className="h-3 w-3 flex-shrink-0" />
                       <div className="min-w-0">
                         <div className="truncate font-medium">{idea.submitted_by || 'Anonymous'}</div>
                         {idea.submitted_by_company && (
                           <div className="truncate text-xs opacity-70">{idea.submitted_by_company}</div>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center gap-1 text-xs text-muted-foreground">
                       <Clock className="h-3 w-3" />
                       <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => console.log('Create Jira ticket for:', idea.title)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Create
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {ideas.length === 0 && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No ideas found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Be the first to submit an innovative idea!"}
            </p>
            {onOpenSubmissionForm && (
              <Button onClick={onOpenSubmissionForm} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Submit First Idea
              </Button>
            )}
          </div>
        </Card>
      )}
      </div>
    </>
  );
}