import { IdeaCard } from "./IdeaCard";
import { type IdeaWithVotes } from "@/lib/supabase";

interface IdeaGridProps {
  ideas: IdeaWithVotes[];
  onVote: (ideaId: string) => Promise<boolean>;
  onUnvote: (ideaId: string) => Promise<boolean>;
  votedIdeas: Set<string>;
  remainingVotes: number;
}

export function IdeaGrid({ ideas, onVote, onUnvote, votedIdeas, remainingVotes }: IdeaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onVote={onVote}
          onUnvote={onUnvote}
          hasVotedFor={votedIdeas.has(idea.id)}
          remainingVotes={remainingVotes}
        />
      ))}
    </div>
  );
}