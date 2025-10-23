import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type IdeaWithVotes } from "@/lib/supabase";
import { ArrowUp, Clock, User, Tag, Calendar, MessageSquare, Users, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
  "Planned": { color: "bg-status-planned text-white", icon: "📅" },
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
  const [showVoters, setShowVoters] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { user } = useAuth();
  
  if (!idea) return null;

  const statusStyle = statusConfig[idea.status] || { color: "bg-muted text-muted-foreground", icon: "📝" };
  
  // Parse voters data
  const voters = idea.voters ? (Array.isArray(idea.voters) ? idea.voters : []) : [];

  // Fetch comments when dialog opens
  useEffect(() => {
    if (isOpen && idea) {
      fetchComments();
    }
  }, [isOpen, idea?.id]);

  const fetchComments = async () => {
    if (!idea) return;
    
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          idea_id: idea.id,
          user_id: user.id,
          comment_text: newComment.trim()
        });

      if (error) throw error;

      toast.success('Comment added successfully');
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

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
          <div className="space-y-4">
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
                  variant={hasVoted ? "outline" : "default"}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  {hasVoted ? 'Remove Vote' : 'Vote for this Idea'}
                </Button>
              )}
            </div>

            {/* View Voters Section */}
            {voters.length > 0 && (
              <Card className="p-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowVoters(!showVoters)}
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">View Votes ({voters.length})</span>
                  </div>
                  {showVoters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showVoters && (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {voters.map((voter: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{voter.email || 'Anonymous'}</p>
                          {voter.full_name && (
                            <p className="text-xs text-muted-foreground truncate">{voter.full_name}</p>
                          )}
                          {voter.company_name && (
                            <p className="text-xs text-muted-foreground truncate">{voter.company_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </h3>

              {/* Add Comment Form */}
              <Card className="p-4 mb-4">
                <Textarea
                  placeholder={user ? "Add a comment..." : "Sign in to add a comment"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user || isSubmittingComment}
                  className="mb-3 min-h-[80px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!user || isSubmittingComment || !newComment.trim()}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </Card>

              {/* Comments List */}
              <div className="space-y-3">
                {isLoadingComments ? (
                  <div className="text-center text-muted-foreground py-4">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {comment.comment_text}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
