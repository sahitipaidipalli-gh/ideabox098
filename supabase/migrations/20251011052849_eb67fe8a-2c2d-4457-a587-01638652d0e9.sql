-- Create a demo user profile for voting (without needing auth.users)
-- First, temporarily relax the foreign key constraint to allow demo profile
DO $$ 
BEGIN
  -- Insert demo profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000099') THEN
    -- Temporarily drop the foreign key constraint
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    
    -- Insert demo user
    INSERT INTO public.profiles (id, email, full_name, company_name)
    VALUES ('00000000-0000-0000-0000-000000000099', 'demo@demo.com', 'Demo User', 'Demo Company');
    
    -- Add back the constraint but make it not validated (allows existing rows)
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;

-- Relax voting policies for demo purposes
DROP POLICY IF EXISTS "Users can insert their own votes" ON public.votes;
CREATE POLICY "Anyone can vote for demo" 
  ON public.votes FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
CREATE POLICY "Anyone can unvote for demo" 
  ON public.votes FOR DELETE 
  USING (true);