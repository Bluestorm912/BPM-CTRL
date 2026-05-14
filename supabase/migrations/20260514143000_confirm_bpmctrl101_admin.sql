-- Confirms and grants CMS admin access to the BPM CTRL owner account.
-- The password stays in Supabase Auth; this migration never stores it.

UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE lower(email) = 'bpmctrl101@gmail.com';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'bpmctrl101@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
