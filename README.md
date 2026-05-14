# BPM CTRL

BPM CTRL is a community-led radio, music, editorial, DJ set, shop, and culture platform built with React, Vite, Supabase, and Netlify.

## Local Development

```sh
npm install
npm run dev
```

The app expects Supabase credentials in `.env`. Use `.env.example` as the template.

## Build

```sh
npm run build
```

Netlify builds from `dist` using the settings in `netlify.toml`.

## Deploy

The connected Netlify site is:

- Site ID: `ecb00cac-fc19-496f-9783-514396368b73`
- Production URL: `https://bpmctrl.com`

Manual production deploy:

```sh
npx netlify-cli deploy --prod --dir=dist --site ecb00cac-fc19-496f-9783-514396368b73
```

## Backend Setup

Supabase migrations live in `supabase/migrations`. They create the shop, editorial, app copy, role, DJ submission, and community application tables.

Apply migrations before testing admin workflows:

```sh
npx supabase link --project-ref gmlggvtdiqwjzaylvpky
npx supabase db push
```

After migrations are applied, create your first admin by adding a row to `public.team_roles` with your Supabase user ID and the `admin` role.

## Key Routes

- `/` - Home, radio entry, stories, shop and community paths
- `/radio` - Live radio and music rooms
- `/shop` - Drops, shop account, saved addresses, and order history
- `/submit-set` - DJ set submissions for editorial review
- `/careers` - Join, volunteer, intern, fund, mission, and members
- `/admin` - Role-based content, shop, submission, copy, and analytics tools

## Notes

Public DJ uploads are limited in the frontend and stored in the `community-submissions` bucket. Admins still review every submitted set before it appears publicly.
