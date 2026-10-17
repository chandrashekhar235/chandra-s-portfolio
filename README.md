# Chandra Shekhar — Portfolio

Next.js 14 portfolio with an animated intro (skills network → portrait plexus), smooth scrolling, custom cursor, scroll progress, an interactive system-pipeline explorer, and a working contact form.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Edit your content

Everything lives in `lib/content.ts` (name, links, projects, experience, skills).
Also check these hand-written spots: `components/Hero.tsx` (roles), `components/Loader.tsx` (skill labels in the intro), `components/TechMarquee.tsx`, `components/AgentPipeline.tsx` (FoundrAI stages).

## Portrait intro

The intro draws points from `public/portrait-points.json`. To rebuild it from a different photo, put a transparent-background PNG at `public/portrait-cutout.png` (head and shoulders, centred) and run:

```bash
npm run generate:points
```

## Contact form

The form needs Supabase + Resend (+ optional Upstash). Copy `.env.example` to `.env.local` and follow `BACKEND_SETUP.md`. Set `NEXT_PUBLIC_SITE_URL` to your live URL when you deploy.
# chandra-s-portfolio
