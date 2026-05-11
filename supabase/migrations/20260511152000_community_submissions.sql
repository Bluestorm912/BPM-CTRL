-- Public DJ set submissions and community applications.

CREATE TABLE IF NOT EXISTS public.dj_set_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  genre text NOT NULL DEFAULT '',
  set_url text NOT NULL DEFAULT '',
  audio_url text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dj_set_submissions_status_check CHECK (status IN ('pending','published','rejected'))
);

CREATE TABLE IF NOT EXISTS public.community_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  interest text NOT NULL DEFAULT 'volunteer',
  skills text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_applications_interest_check CHECK (interest IN ('volunteer','intern','fund')),
  CONSTRAINT community_applications_status_check CHECK (status IN ('new','contacted','closed'))
);

ALTER TABLE public.dj_set_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_applications ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_dj_set_submissions_updated_at ON public.dj_set_submissions;
CREATE TRIGGER update_dj_set_submissions_updated_at
  BEFORE UPDATE ON public.dj_set_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  CREATE POLICY "Published DJ sets are public"
    ON public.dj_set_submissions FOR SELECT
    TO anon, authenticated
    USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can submit DJ sets"
    ON public.dj_set_submissions FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Staff can manage DJ set submissions"
    ON public.dj_set_submissions FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin','editor','media_manager','moderator']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor','media_manager','moderator']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can submit community applications"
    ON public.community_applications FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Staff can read community applications"
    ON public.community_applications FOR SELECT
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin','editor','moderator']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_dj_set_submissions_status ON public.dj_set_submissions (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_applications_interest ON public.community_applications (interest, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('community-submissions', 'community-submissions', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DO $$
BEGIN
  CREATE POLICY "Community submissions are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-submissions');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can upload community submissions"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'community-submissions');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.dj_set_submissions;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.community_applications;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order)
VALUES
('community', 'community_title_1', 'A platform for the culture.', 'text', 0),
('community', 'community_title_2', 'Built by the community.', 'text', 1),
('community', 'community_body_1', 'BPM CTRL is a community-led media and radio project documenting music, nightlife, fashion, movement, and the people shaping the scene.', 'text', 2),
('community', 'community_body_2', 'Writers, DJs, photographers, designers, volunteers, interns, supporters, and organizers can contribute from anywhere in the world.', 'text', 3),
('community', 'community_body_3', 'Submit your story, send your set, join the team, or fund the cause. The signal grows when the community builds it.', 'text', 4)
ON CONFLICT (section, content_key) DO UPDATE
SET content_value = EXCLUDED.content_value,
    updated_at = now();
