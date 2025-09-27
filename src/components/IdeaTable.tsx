import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, Clock, User, Tag, ChevronDown, ChevronUp, Search, Plus } from "lucide-react";
import { useState } from "react";
import { type Idea } from "./IdeaCard";

interface IdeaTableProps {
  ideas: Idea[];
  onVote: (ideaId: string) => void;
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

export function IdeaTable({ ideas, onVote, votedIdeas, remainingVotes, onOpenSubmissionForm, searchTerm, statusFilter, categoryFilter }: IdeaTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [votingStates, setVotingStates] = useState<Set<string>>(new Set());

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
    if (votedIdeas.has(ideaId) || remainingVotes <= 0) return;
    
    setVotingStates(prev => new Set(prev).add(ideaId));
    setTimeout(() => {
      onVote(ideaId);
      setVotingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(ideaId);
        return newSet;
      });
    }, 300);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[40%]">Idea</TableHead>
            <TableHead className="w-[12%]">Category</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[8%] text-center">Votes</TableHead>
            <TableHead className="w-[10%]">Frequency</TableHead>
            <TableHead className="w-[15%]">Submitted</TableHead>
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
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors leading-tight">
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
                
                <TableCell>
                  <Badge className={`status-badge ${statusStyle.color} text-xs`}>
                    <span className="mr-1">{statusStyle.icon}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(idea.id)}
                    disabled={hasVoted || remainingVotes <= 0 || isVoting}
                    className={`vote-button flex flex-col items-center gap-1 px-2 py-1 h-auto min-w-[50px] ${
                      hasVoted 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'hover:bg-primary/10 hover:border-primary/50'
                    }`}
                  >
                    <ArrowUp className={`h-3 w-3 ${isVoting ? 'animate-bounce' : ''}`} />
                    <span className="text-xs font-medium">{idea.votes}</span>
                  </Button>
                </TableCell>
                
                <TableCell>
                  <Badge variant={idea.usage_frequency === "High" ? "default" : "secondary"} className="text-xs">
                    {idea.usage_frequency}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">{idea.submittedBy}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(idea.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
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
  );
}