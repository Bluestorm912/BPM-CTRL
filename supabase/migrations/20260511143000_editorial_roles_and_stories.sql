-- Role-based editorial workspace for BPM CTRL as a media/news platform.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'writer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'creator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'media_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'shop_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'analyst';

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role::text = ANY(_roles)
  )
$$;

CREATE TABLE IF NOT EXISTS public.culture_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  author_name text NOT NULL DEFAULT '',
  author_email text NOT NULL DEFAULT '',
  title text NOT NULL,
  intro text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Culture',
  tags text[] NOT NULL DEFAULT '{}',
  hero_image text NOT NULL DEFAULT '',
  gallery_images text[] NOT NULL DEFAULT '{}',
  audio_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  editor_notes text NOT NULL DEFAULT '',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT culture_stories_status_check CHECK (status IN ('draft', 'in_review', 'published', 'rejected'))
);

ALTER TABLE public.culture_stories ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_culture_stories_updated_at ON public.culture_stories;
CREATE TRIGGER update_culture_stories_updated_at
  BEFORE UPDATE ON public.culture_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_culture_stories_status_published ON public.culture_stories (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_culture_stories_author ON public.culture_stories (author_id, updated_at DESC);

DO $$
BEGIN
  CREATE POLICY "Published culture stories are public"
    ON public.culture_stories FOR SELECT
    TO anon, authenticated
    USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Staff can read assigned culture stories"
    ON public.culture_stories FOR SELECT
    TO authenticated
    USING (
      author_id = auth.uid()
      OR public.has_any_role(auth.uid(), ARRAY['admin','editor','moderator'])
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Writers and creators can create stories"
    ON public.culture_stories FOR INSERT
    TO authenticated
    WITH CHECK (
      author_id = auth.uid()
      AND public.has_any_role(auth.uid(), ARRAY['admin','editor','writer','creator','media_manager'])
      AND status IN ('draft','in_review')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Writers can update their own unpublished stories"
    ON public.culture_stories FOR UPDATE
    TO authenticated
    USING (
      author_id = auth.uid()
      AND public.has_any_role(auth.uid(), ARRAY['writer','creator','media_manager'])
      AND status IN ('draft','in_review','rejected')
    )
    WITH CHECK (
      author_id = auth.uid()
      AND status IN ('draft','in_review')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Editors can manage culture stories"
    ON public.culture_stories FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Editors can manage app copy"
    ON public.site_content FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Media staff can upload assets"
    ON public.site_assets FOR INSERT
    TO authenticated
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor','creator','media_manager']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Media staff can update assets"
    ON public.site_assets FOR UPDATE
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin','editor','media_manager']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor','media_manager']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Shop managers can manage products"
    ON public.shop_products FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin','shop_manager']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','shop_manager']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Media staff can upload storage objects"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-assets' AND public.has_any_role(auth.uid(), ARRAY['admin','editor','writer','creator','media_manager']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Media staff can update storage objects"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-assets' AND public.has_any_role(auth.uid(), ARRAY['admin','editor','media_manager']))
    WITH CHECK (bucket_id = 'site-assets' AND public.has_any_role(auth.uid(), ARRAY['admin','editor','media_manager']));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.list_staff_members()
RETURNS TABLE (
  user_id uuid,
  email text,
  roles text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin']) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  RETURN QUERY
  SELECT
    users.id,
    users.email::text,
    array_agg(user_roles.role::text ORDER BY user_roles.role::text) AS roles,
    users.created_at
  FROM auth.users
  JOIN public.user_roles ON user_roles.user_id = users.id
  GROUP BY users.id, users.email, users.created_at
  ORDER BY users.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_staff_role_by_email(p_email text, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin']) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = lower(p_email)
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email %. Ask them to create an account first.', p_email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, p_role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_staff_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin']) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = p_user_id
  AND role = p_role::public.app_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_staff_members() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_staff_role_by_email(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_staff_role(uuid, text) TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.culture_stories;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order)
VALUES
('articles', 'articles_title', 'CULTURE STORIES', 'text', 3),
('articles', 'articles_description', 'Stories, interviews, field notes, photos, audio, and video from the BPM CTRL network.', 'text', 4)
ON CONFLICT (section, content_key) DO UPDATE
SET content_value = EXCLUDED.content_value,
    updated_at = now();
