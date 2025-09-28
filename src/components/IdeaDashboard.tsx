import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IdeaTable } from "./IdeaTable";
import { IdeaGrid } from "./IdeaGrid";
import { type IdeaWithVotes } from "@/lib/supabase";
import { Search, Filter, Plus, TrendingUp, Clock, CheckCircle2, Grid, List } from "lucide-react";

interface IdeaDashboardProps {
  ideas: IdeaWithVotes[];
  onVoteForIdea: (ideaId: string) => Promise<boolean | void>;
  onUnvoteForIdea?: (ideaId: string) => Promise<boolean | void>;
  votedIdeas: Set<string>;
  remainingVotes: number;
  onOpenSubmissionForm: () => void;
}

export function IdeaDashboard({ ideas, onVoteForIdea, onUnvoteForIdea, votedIdeas, remainingVotes, onOpenSubmissionForm }: IdeaDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas.filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          idea.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || idea.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort ideas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes;
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [ideas, searchTerm, statusFilter, categoryFilter, sortBy]);

  const categories = [...new Set(ideas.map(idea => idea.category))];
  const statuses = [...new Set(ideas.map(idea => idea.status))];

  const stats = {
    total: ideas.length,
    inProgress: ideas.filter(idea => idea.status === "Development In Progress").length,
    released: ideas.filter(idea => idea.status === "Released").length,
    totalVotes: ideas.reduce((sum, idea) => sum + idea.votes, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Idea Box
          </h1>
          <p className="text-muted-foreground mt-1">
            Community-driven innovation hub • {remainingVotes} votes remaining this quarter
          </p>
        </div>
        
        <Button onClick={onOpenSubmissionForm} className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Submit New Idea
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Ideas</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-status-progress/10 rounded-lg">
              <Clock className="h-4 w-4 text-status-progress" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-status-released/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-status-released" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.released}</p>
              <p className="text-xs text-muted-foreground">Released</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalVotes}</p>
              <p className="text-xs text-muted-foreground">Total Votes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ideas by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="votes">Most Votes</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex bg-muted/20 rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <Badge variant="secondary">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge variant="secondary">
                Category: {categoryFilter}
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Ideas Display */}
      {viewMode === "table" ? (
        <IdeaTable
          ideas={filteredAndSortedIdeas}
          onVote={onVoteForIdea}
          votedIdeas={votedIdeas}
          remainingVotes={remainingVotes}
          onOpenSubmissionForm={onOpenSubmissionForm}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
        />
      ) : (
        <IdeaGrid
          ideas={filteredAndSortedIdeas}
          onVote={async (ideaId) => {
            const result = await onVoteForIdea(ideaId);
            return result !== false;
          }}
          onUnvote={async (ideaId) => {
            if (onUnvoteForIdea) {
              const result = await onUnvoteForIdea(ideaId);
              return result !== false;
            }
            return false;
          }}
          votedIdeas={votedIdeas}
          remainingVotes={remainingVotes}
        />
      )}
    </div>
  );
}