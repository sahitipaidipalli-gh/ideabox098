import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export function useVoting() {
  const [remainingVotes, setRemainingVotes] = useState(5)
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchVotingData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Get remaining votes
      const { data: remaining, error: remainingError } = await supabase
        .rpc('get_user_votes_remaining', { user_uuid: user.id })

      if (remainingError) throw remainingError
      setRemainingVotes(remaining || 0)

      // Get user's current votes
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('idea_id')
        .eq('user_id', user.id)

      if (votesError) throw votesError
      setUserVotes(votes?.map(v => v.idea_id) || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch voting data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVotingData()
  }, [user])

  const voteForIdea = async (ideaId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote for ideas.",
        variant: "destructive",
      })
      return false
    }

    if (remainingVotes <= 0) {
      toast({
        title: "No Votes Remaining",
        description: "You have used all your votes for this quarter.",
        variant: "destructive",
      })
      return false
    }

    if (userVotes.includes(ideaId)) {
      toast({
        title: "Already Voted",
        description: "You have already voted for this idea.",
        variant: "destructive",
      })
      return false
    }

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          idea_id: ideaId,
          user_id: user.id,
        })

      if (error) throw error

      // Update local state
      setUserVotes(prev => [...prev, ideaId])
      setRemainingVotes(prev => prev - 1)

      toast({
        title: "Vote Recorded",
        description: "Your vote has been recorded successfully!",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const unvoteForIdea = async (ideaId: string) => {
    if (!user) return false

    if (!userVotes.includes(ideaId)) {
      toast({
        title: "Not Voted",
        description: "You haven't voted for this idea.",
        variant: "destructive",
      })
      return false
    }

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setUserVotes(prev => prev.filter(id => id !== ideaId))
      setRemainingVotes(prev => prev + 1)

      toast({
        title: "Vote Removed",
        description: "Your vote has been removed successfully!",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  const getQuarterInfo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const quarter = Math.floor(now.getMonth() / 3) + 1
    const quarterStart = new Date(year, (quarter - 1) * 3, 1)
    const nextQuarterStart = new Date(year + (quarter === 4 ? 1 : 0), quarter === 4 ? 0 : quarter * 3, 1)
    
    return {
      currentQuarter: `${year}-Q${quarter}`,
      quarterStart,
      nextQuarterStart,
      votesUsed: 5 - remainingVotes,
      totalVotes: 5,
    }
  }

  return {
    remainingVotes,
    userVotes,
    loading,
    voteForIdea,
    unvoteForIdea,
    getQuarterInfo,
    refetch: fetchVotingData,
  }
}