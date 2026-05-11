-- Idempotent BPM CTRL foundation for a fresh Supabase project.
-- Applies the tables, policies, seed content, storage bucket, and requested admin role.

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE IF NOT EXISTS public.site_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  section TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'image',
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  content_key text NOT NULL,
  content_value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section, content_key)
);

CREATE TABLE IF NOT EXISTS public.radio_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL DEFAULT '',
  description text DEFAULT '',
  cover_image_url text DEFAULT '',
  audio_url text NOT NULL,
  storage_path text NOT NULL DEFAULT '',
  duration_seconds integer DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.signal_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias text NOT NULL,
  alias_normalized text NOT NULL UNIQUE,
  xp integer NOT NULL DEFAULT 50,
  join_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT signal_alias_length CHECK (char_length(alias) BETWEEN 3 AND 32),
  CONSTRAINT signal_alias_charset CHECK (alias ~ '^[A-Za-z0-9 _.-]+$')
);

CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL DEFAULT '/',
  title text DEFAULT '',
  referrer text DEFAULT '',
  user_agent text DEFAULT '',
  session_id text DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text DEFAULT '',
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text DEFAULT '',
  summary text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  loyalty_points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'Signal Member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL DEFAULT 'Default',
  recipient_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address_line_1 text NOT NULL,
  address_line_2 text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'Nigeria',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Apparel',
  price integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  image_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  stock_quantity integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE DEFAULT ('BPM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  subtotal integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  shipping_address jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.shop_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.shop_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Site assets are publicly readable"
    ON public.site_assets FOR SELECT
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage site assets"
    ON public.site_assets FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can read all site assets"
    ON public.site_assets FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Site content is publicly readable"
    ON public.site_content FOR SELECT
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage site content"
    ON public.site_content FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Radio tracks are publicly readable"
    ON public.radio_tracks FOR SELECT TO public
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage radio tracks"
    ON public.radio_tracks FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Signal identities are publicly readable"
    ON public.signal_identities FOR SELECT TO anon, authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can record page visits"
    ON public.page_visits FOR INSERT TO anon, authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can read page visits"
    ON public.page_visits FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage activity logs"
    ON public.admin_activity_log FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can read their own profile"
    ON public.shop_customers FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can create their own profile"
    ON public.shop_customers FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can update their own profile"
    ON public.shop_customers FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
    WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can manage their own addresses"
    ON public.shop_addresses FOR ALL TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
    WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Published shop products are public"
    ON public.shop_products FOR SELECT TO anon, authenticated
    USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage shop products"
    ON public.shop_products FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can read their own orders"
    ON public.shop_orders FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can create their own orders"
    ON public.shop_orders FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can update shop orders"
    ON public.shop_orders FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can read their own order items"
    ON public.shop_order_items FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.shop_orders
        WHERE shop_orders.id = shop_order_items.order_id
        AND (shop_orders.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Customers can create order items for own orders"
    ON public.shop_order_items FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.shop_orders
        WHERE shop_orders.id = shop_order_items.order_id
        AND shop_orders.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON public.signal_identities TO anon, authenticated;

DROP TRIGGER IF EXISTS update_site_assets_updated_at ON public.site_assets;
CREATE TRIGGER update_site_assets_updated_at
  BEFORE UPDATE ON public.site_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_content_updated_at ON public.site_content;
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_radio_tracks_updated_at ON public.radio_tracks;
CREATE TRIGGER update_radio_tracks_updated_at
  BEFORE UPDATE ON public.radio_tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_signal_identities_updated_at ON public.signal_identities;
CREATE TRIGGER update_signal_identities_updated_at
  BEFORE UPDATE ON public.signal_identities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_site_assets_section ON public.site_assets (section, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_assets_active ON public.site_assets (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content (section, sort_order);
CREATE INDEX IF NOT EXISTS idx_signal_identities_xp ON public.signal_identities (xp DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_path_created_at ON public.page_visits (path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity ON public.admin_activity_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_shop_addresses_user_id ON public.shop_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_user_id_created_at ON public.shop_orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_products_status_category ON public.shop_products (status, category);

DROP TRIGGER IF EXISTS update_shop_customers_updated_at ON public.shop_customers;
CREATE TRIGGER update_shop_customers_updated_at
  BEFORE UPDATE ON public.shop_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_addresses_updated_at ON public.shop_addresses;
CREATE TRIGGER update_shop_addresses_updated_at
  BEFORE UPDATE ON public.shop_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_products_updated_at ON public.shop_products;
CREATE TRIGGER update_shop_products_updated_at
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_orders_updated_at ON public.shop_orders;
CREATE TRIGGER update_shop_orders_updated_at
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DO $$
BEGIN
  CREATE POLICY "Site assets are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-assets');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can upload site assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can update site assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can delete site assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.submit_signal_alias(p_alias text)
RETURNS TABLE (
  id uuid,
  alias text,
  xp integer,
  join_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alias text;
  v_normalized text;
BEGIN
  v_alias := trim(p_alias);

  IF v_alias IS NULL OR char_length(v_alias) < 3 OR char_length(v_alias) > 32 THEN
    RAISE EXCEPTION 'Alias must be between 3 and 32 characters';
  END IF;

  IF v_alias !~ '^[A-Za-z0-9 _.-]+$' THEN
    RAISE EXCEPTION 'Alias contains invalid characters';
  END IF;

  v_normalized := lower(v_alias);

  RETURN QUERY
  INSERT INTO public.signal_identities (alias, alias_normalized, xp, join_count)
  VALUES (v_alias, v_normalized, 50, 1)
  ON CONFLICT (alias_normalized)
  DO UPDATE
    SET alias = EXCLUDED.alias,
        join_count = public.signal_identities.join_count + 1,
        xp = LEAST(public.signal_identities.xp + 50, 5000),
        updated_at = now()
  RETURNING
    public.signal_identities.id,
    public.signal_identities.alias,
    public.signal_identities.xp,
    public.signal_identities.join_count,
    public.signal_identities.created_at,
    public.signal_identities.updated_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_signal_alias(text) TO anon, authenticated;

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order) VALUES
('hero', 'hero_tagline', 'Transmitting Signal', 'text', 0),
('hero', 'hero_title', 'BPM CTRL', 'text', 1),
('hero', 'hero_subtitle_1', 'Dance is the language.', 'text', 2),
('hero', 'hero_subtitle_2', 'Fashion is the expression.', 'text', 3),
('hero', 'hero_cta_primary', 'Enter the Signal', 'text', 4),
('hero', 'hero_cta_secondary', 'Access Tickets', 'text', 5),
('hero', 'hero_cta_primary_href', '#signal', 'text', 6),
('event', 'event_name', 'FREQUENCY 001', 'text', 0),
('event', 'event_tagline', 'Incoming Transmission', 'text', 1),
('event', 'event_description', 'The first transmission. An underground convergence of sound, movement, and collective energy. This is not just an event - it''s a signal activation.', 'text', 2),
('event', 'event_date', 'TBA 2026', 'text', 3),
('event', 'event_location', 'Classified', 'text', 4),
('event', 'event_capacity', 'Limited', 'text', 5),
('event', 'event_lineup', 'Incoming...', 'text', 6),
('event', 'event_cta_primary', 'Enter the Frequency', 'text', 7),
('event', 'event_cta_secondary', 'Get Notified', 'text', 8),
('broadcast', 'broadcast_tagline', 'Live Transmissions', 'text', 0),
('broadcast', 'broadcast_title', 'BPM CTRL BROADCAST', 'text', 1),
('broadcast', 'broadcast_description', 'DJ sets, crowd moments, dance clips, and artist interviews - the signal never stops.', 'text', 2),
('style', 'style_tagline', 'Fashion x Frequency', 'text', 0),
('style', 'style_title', 'BPM CTRL STYLE INDEX', 'text', 1),
('style', 'style_description', 'Rave culture is fashion culture. Explore the looks that define the movement.', 'text', 2),
('archive', 'archive_tagline', 'Decoded Memories', 'text', 0),
('archive', 'archive_title', 'TRANSMISSION ARCHIVE', 'text', 1),
('archive', 'archive_description', 'Open past rave memories. Every signal leaves a trace.', 'text', 2),
('articles', 'articles_template', '{"titleMaxWords":12,"introMaxWords":45,"bodyMaxWords":500,"heroWidth":1600,"heroHeight":900,"galleryWidth":1080,"galleryHeight":1080,"galleryCount":2}', 'json', 0),
('articles', 'articles_items', '[]', 'json', 1),
('articles', 'articles_tagline', 'Field Notes', 'text', 2),
('articles', 'articles_title', 'TRANSMISSION ARTICLES', 'text', 3),
('articles', 'articles_description', 'Long-form signal drops with structured media layouts managed from admin.', 'text', 4),
('community', 'community_title_1', 'We don''t just throw raves.', 'text', 0),
('community', 'community_title_2', 'We build culture.', 'text', 1),
('community', 'community_body_1', 'BPM CTRL is a Nigerian-born movement rooted in Afro house, underground dance energy, and fashion expression. We transmit a signal that connects those who move to the same frequency.', 'text', 2),
('community', 'community_body_2', 'Dance is spiritual release. Fashion is personal expression. Together they form the language of our community - a space where every body belongs and the bass hits different.', 'text', 3),
('community', 'community_body_3', 'No hierarchy. No ego. Just pulse.', 'text', 4),
('email', 'email_title', 'STAY ON THE FREQUENCY', 'text', 0),
('email', 'email_description', 'Get early event access, secret drops, and community updates. No spam - only signal.', 'text', 1),
('email', 'email_cta', 'Join Signal', 'text', 2),
('links', 'instagram_url', 'https://instagram.com', 'text', 0),
('links', 'twitter_url', 'https://twitter.com', 'text', 1),
('links', 'tiktok_url', 'https://tiktok.com', 'text', 2),
('links', 'access_ticket_url', '#event', 'text', 3),
('radio', 'radio_mode', 'off', 'text', 0),
('radio', 'radio_stream_url', '', 'text', 1),
('radio', 'radio_live_title', '', 'text', 2),
('radio', 'radio_live_description', '', 'text', 3),
('radio', 'radio_live_image', '', 'text', 4)
ON CONFLICT (section, content_key) DO NOTHING;

INSERT INTO public.shop_products (slug, name, description, category, price, currency, status, stock_quantity)
VALUES
('bpm-ctrl-signal-tee', 'BPM CTRL Signal Tee', 'Radio merch for late nights and warm systems.', 'Apparel', 38000, 'NGN', 'published', 40),
('frequency-cap', 'Frequency Cap', 'A low-profile cap for signal carriers.', 'Accessories', 24000, 'NGN', 'published', 30),
('transmission-poster-001', 'Transmission Poster 001', 'Limited print from the first signal drop.', 'Prints', 18000, 'NGN', 'published', 20)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) IN ('michaelseth13@gmail.com', 'bpmctrl101@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_tracks;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.signal_identities;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_orders;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;
