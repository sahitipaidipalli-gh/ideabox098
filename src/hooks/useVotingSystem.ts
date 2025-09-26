import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const VOTES_PER_QUARTER = 5;
const STORAGE_KEY = "ideaBox_votingData";

interface VotingData {
  votedIdeas: string[];
  quarterStart: string;
  votesUsed: number;
}

export function useVotingSystem() {
  const [votedIdeas, setVotedIdeas] = useState<Set<string>>(new Set());
  const [remainingVotes, setRemainingVotes] = useState(VOTES_PER_QUARTER);
  const { toast } = useToast();

  // Initialize voting data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data: VotingData = JSON.parse(savedData);
        const currentQuarter = getCurrentQuarter();
        
        // Check if we're in a new quarter
        if (data.quarterStart !== currentQuarter) {
          // New quarter - reset votes
          const newData: VotingData = {
            votedIdeas: [],
            quarterStart: currentQuarter,
            votesUsed: 0
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          setVotedIdeas(new Set());
          setRemainingVotes(VOTES_PER_QUARTER);
        } else {
          // Same quarter - restore data
          setVotedIdeas(new Set(data.votedIdeas));
          setRemainingVotes(VOTES_PER_QUARTER - data.votesUsed);
        }
      } catch (error) {
        console.error("Error parsing voting data:", error);
        initializeVotingData();
      }
    } else {
      initializeVotingData();
    }
  }, []);

  const initializeVotingData = () => {
    const currentQuarter = getCurrentQuarter();
    const newData: VotingData = {
      votedIdeas: [],
      quarterStart: currentQuarter,
      votesUsed: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setVotedIdeas(new Set());
    setRemainingVotes(VOTES_PER_QUARTER);
  };

  const getCurrentQuarter = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `${year}-Q${quarter}`;
  };

  const voteForIdea = (ideaId: string) => {
    if (votedIdeas.has(ideaId)) {
      toast({
        title: "Already Voted",
        description: "You have already voted for this idea.",
        variant: "destructive",
      });
      return false;
    }

    if (remainingVotes <= 0) {
      toast({
        title: "No Votes Remaining",
        description: "You have used all your votes for this quarter. Votes reset every quarter.",
        variant: "destructive",
      });
      return false;
    }

    // Update state
    const newVotedIdeas = new Set(votedIdeas).add(ideaId);
    setVotedIdeas(newVotedIdeas);
    setRemainingVotes(prev => prev - 1);

    // Update localStorage
    const currentQuarter = getCurrentQuarter();
    const updatedData: VotingData = {
      votedIdeas: Array.from(newVotedIdeas),
      quarterStart: currentQuarter,
      votesUsed: VOTES_PER_QUARTER - remainingVotes + 1
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

    toast({
      title: "Vote Recorded! 🗳️",
      description: `You have ${remainingVotes - 1} votes remaining this quarter.`,
    });

    return true;
  };

  const getQuarterInfo = () => {
    const currentQuarter = getCurrentQuarter();
    const nextQuarterDate = getNextQuarterDate();
    
    return {
      currentQuarter,
      nextQuarterDate,
      votesUsed: VOTES_PER_QUARTER - remainingVotes,
      totalVotes: VOTES_PER_QUARTER
    };
  };

  const getNextQuarterDate = (): Date => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarter = Math.floor(month / 3);
    
    // Start of next quarter
    const nextQuarterMonth = (quarter + 1) * 3;
    
    if (nextQuarterMonth >= 12) {
      return new Date(year + 1, 0, 1);
    } else {
      return new Date(year, nextQuarterMonth, 1);
    }
  };

  return {
    votedIdeas,
    remainingVotes,
    voteForIdea,
    getQuarterInfo
  };
}