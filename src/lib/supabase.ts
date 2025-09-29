import { supabase as _supabase } from '@/integrations/supabase/client'
export const supabase = _supabase as any
export type { Database } from '@/integrations/supabase/types'

export type IdeaWithVotes = {
  id: string
  title: string
  description: string
  category: string
  usage_frequency: 'High' | 'Low'
  status: 'Under Review' | 'Planned in Q4' | 'Development In Progress' | 'Released' | 'Will be revisited later'
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  votes: number
  voters: Array<{
    user_id: string
    full_name: string | null
    company_name: string | null
  }>
  submitted_by: string | null
  submitted_by_company: string | null
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
  updated_at: string
}