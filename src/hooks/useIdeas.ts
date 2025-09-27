import { useState, useEffect } from 'react'
import { supabase, type IdeaWithVotes } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useIdeas() {
  const [ideas, setIdeas] = useState<IdeaWithVotes[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas_with_votes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch ideas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('ideas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ideas'
      }, () => {
        fetchIdeas()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes'
      }, () => {
        fetchIdeas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const submitIdea = async (ideaData: {
    title: string
    description: string
    category: string
    usageFrequency: 'High' | 'Low'
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('ideas')
        .insert({
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category,
          usage_frequency: ideaData.usageFrequency,
          created_by: user.id,
        })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Your idea has been submitted successfully.",
      })

      await fetchIdeas()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return {
    ideas,
    loading,
    submitIdea,
    refetch: fetchIdeas,
  }
}