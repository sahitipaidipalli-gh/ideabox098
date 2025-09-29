import { supabase as typedSupabase } from '@/integrations/supabase/client'
export const supabase = typedSupabase as any


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
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
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          usage_frequency: 'High' | 'Low'
          status?: 'Under Review' | 'Planned in Q4' | 'Development In Progress' | 'Released' | 'Will be revisited later'
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          usage_frequency?: 'High' | 'Low'
          status?: 'Under Review' | 'Planned in Q4' | 'Development In Progress' | 'Released' | 'Will be revisited later'
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      ideas_with_votes: {
        Row: {
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
      }
    }
    Functions: {
      get_user_votes_remaining: {
        Args: { user_uuid: string }
        Returns: number
      }
    }
  }
}

export type IdeaWithVotes = Database['public']['Views']['ideas_with_votes']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']