-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create ideas table (created_by is nullable for demo data)
CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  usage_frequency TEXT CHECK (usage_frequency IN ('High', 'Low')) NOT NULL,
  status TEXT DEFAULT 'Under Review' CHECK (status IN ('Under Review', 'Planned in Q4', 'Development In Progress', 'Released', 'Will be revisited later')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ideas"
  ON public.ideas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ideas"
  ON public.ideas FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all votes"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create view for ideas with votes
CREATE OR REPLACE VIEW public.ideas_with_votes AS
SELECT 
  i.*,
  COALESCE(COUNT(DISTINCT v.id), 0)::INTEGER as votes,
  COALESCE(
    json_agg(
      json_build_object(
        'user_id', p.id,
        'full_name', p.full_name,
        'company_name', p.company_name
      )
    ) FILTER (WHERE v.id IS NOT NULL),
    '[]'::json
  ) as voters,
  creator.full_name as submitted_by,
  creator.company_name as submitted_by_company
FROM public.ideas i
LEFT JOIN public.votes v ON i.id = v.idea_id
LEFT JOIN public.profiles p ON v.user_id = p.id
LEFT JOIN public.profiles creator ON i.created_by = creator.id
GROUP BY i.id, creator.full_name, creator.company_name;

-- Function to get remaining votes
CREATE OR REPLACE FUNCTION public.get_user_votes_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_votes INTEGER := 5;
  used_votes INTEGER;
BEGIN
  SELECT COUNT(*) INTO used_votes
  FROM public.votes
  WHERE user_id = user_uuid;
  
  RETURN total_votes - used_votes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert sample ideas (no user required)
INSERT INTO public.ideas (title, description, category, usage_frequency, status) VALUES
  (
    'Dark Mode Support',
    'Add a dark mode toggle to reduce eye strain during nighttime usage. This would include a system preference detection and manual toggle option.',
    'UI/UX',
    'High',
    'Planned in Q4'
  ),
  (
    'Bulk Export Feature',
    'Allow users to export multiple records at once in CSV or Excel format. This would save time for users managing large datasets.',
    'Data Management',
    'High',
    'Under Review'
  ),
  (
    'Email Notifications',
    'Send email notifications when ideas are updated or commented on. Users should be able to customize notification preferences.',
    'Notifications',
    'Low',
    'Will be revisited later'
  ),
  (
    'Mobile App',
    'Develop native mobile applications for iOS and Android to access ideas on the go.',
    'Platform',
    'High',
    'Under Review'
  ),
  (
    'Advanced Filtering',
    'Add more filtering options including date ranges, multiple categories, and custom tags.',
    'Features',
    'High',
    'Development In Progress'
  ),
  (
    'Commenting System',
    'Allow users to comment on ideas to provide feedback and discuss implementation details.',
    'Collaboration',
    'Low',
    'Under Review'
  ),
  (
    'Integration with Slack',
    'Post new ideas and updates directly to Slack channels for better team visibility.',
    'Integrations',
    'Low',
    'Released'
  ),
  (
    'Keyboard Shortcuts',
    'Add keyboard shortcuts for common actions like submitting ideas, voting, and navigation.',
    'Productivity',
    'Low',
    'Under Review'
  );