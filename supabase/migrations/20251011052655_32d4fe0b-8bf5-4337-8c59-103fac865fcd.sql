-- Fix security issues by setting search_path on functions

-- Update get_user_votes_remaining function with search_path
CREATE OR REPLACE FUNCTION public.get_user_votes_remaining(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_votes INTEGER := 5;
  used_votes INTEGER;
BEGIN
  SELECT COUNT(*) INTO used_votes
  FROM public.votes
  WHERE user_id = user_uuid;
  
  RETURN total_votes - used_votes;
END;
$$;

-- Update handle_new_user function with search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Update update_updated_at function with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate ideas_with_votes view without SECURITY DEFINER
DROP VIEW IF EXISTS public.ideas_with_votes;
CREATE VIEW public.ideas_with_votes
WITH (security_invoker = true) AS
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