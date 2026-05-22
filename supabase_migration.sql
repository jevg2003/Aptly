-- ==========================================
-- APTLY DATABASE MIGRATION & TRIGGER PATCH
-- ==========================================
-- This script fixes the schema cache mismatches and incomplete data replication 
-- for the candidate registration flow.
--
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/fohcutrrhrihvzrvynxz
-- 2. Go to the "SQL Editor" section in the left sidebar.
-- 3. Click "New query", paste the contents of this file, and click "Run".
-- ==========================================

-- 1. Add missing candidate-specific columns to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS candidate_tags text,
ADD COLUMN IF NOT EXISTS industry_interests text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS birth_date text;

-- 2. Update the authentication trigger function to replicate ALL metadata fields correctly.
-- This ensures location, phone, and candidate fields copy on signup and do not remain null.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    avatar_url,
    bio,
    professional_title,
    location,
    phone,
    -- Company specific fields
    tax_id,
    creation_date,
    business_area,
    industry,
    company_tags,
    pdf_name,
    -- Candidate specific fields
    candidate_tags,
    industry_interests,
    experience_level,
    portfolio_url,
    linkedin_url,
    birth_date
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'candidate'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio',
    -- Map 'profession' metadata to 'professional_title' column
    new.raw_user_meta_data->>'profession',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'phone',
    -- Company fields
    new.raw_user_meta_data->>'tax_id',
    new.raw_user_meta_data->>'creation_date',
    new.raw_user_meta_data->>'business_area',
    new.raw_user_meta_data->>'industry',
    new.raw_user_meta_data->>'company_tags',
    new.raw_user_meta_data->>'pdf_name',
    -- Candidate fields
    new.raw_user_meta_data->>'candidate_tags',
    new.raw_user_meta_data->>'industry_interests',
    new.raw_user_meta_data->>'experience_level',
    new.raw_user_meta_data->>'portfolio_url',
    new.raw_user_meta_data->>'linkedin_url',
    new.raw_user_meta_data->>'birth_date'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    professional_title = EXCLUDED.professional_title,
    location = EXCLUDED.location,
    phone = EXCLUDED.phone,
    tax_id = EXCLUDED.tax_id,
    creation_date = EXCLUDED.creation_date,
    business_area = EXCLUDED.business_area,
    industry = EXCLUDED.industry,
    company_tags = EXCLUDED.company_tags,
    pdf_name = EXCLUDED.pdf_name,
    candidate_tags = EXCLUDED.candidate_tags,
    industry_interests = EXCLUDED.industry_interests,
    experience_level = EXCLUDED.experience_level,
    portfolio_url = EXCLUDED.portfolio_url,
    linkedin_url = EXCLUDED.linkedin_url,
    birth_date = EXCLUDED.birth_date,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 3. Success Log
SELECT 'Database schema updated and handle_new_user trigger patched successfully!' AS status;
