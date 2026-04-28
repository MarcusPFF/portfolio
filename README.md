# Marcus Forsberg — Portfolio

Personal portfolio at **[marcuspff.com](https://marcuspff.com/)**. Built with
Next.js 16 + React 19 + Tailwind v4. Includes a RAG-powered AI chatbot, a
spam-hardened contact form, an interactive 3D globe of motorcycle trips, an
LLM-powered assignment assessor, and an interactive meditation quiz.

## What's on the site

| Route | What it is |
|---|---|
| `/` | Hero with inline Q&A chatbot input. Selected projects, skills, contact form, and social links. |
| `/llm` | LLM-course timeline. Each row links to the course's blog; courses with apps (`/llm/course3`, `/llm/course-5`) get an "Open app" pill. |
| `/llm/<slug>/blog` | Per-course blog post (Markdown). Sticky left-side timeline sidebar shows all course blogs. |
| `/llm/course3` | **Course 4 — Meditations-quiz.** 29 questions across 5 sections in Danish; submit-validated, color-coded feedback. |
| `/llm/course-5` | **Course 5 + 6 — AI Assignment Assessor.** Paste a Danish datamatiker internship report, get a Llama-3.3-70B-driven structured assessment against a 5-criterion rubric + Dare-Share-Care framework. |
| `/trips` | Motorcycle trip logbook. Sortable list, EN / DK / DE language switcher, optional 3D globe overlay (NASA Blue Marble texture, multi-tier device-aware mobile fallback). |
| `/trips/<slug>` | Individual trip with sticky year-grouped sidebar, story, highlights, photos. |

## Tech stack

| Layer | Tools |
|---|---|
| Framework | **Next.js 16** (Turbopack, App Router, View Transitions API), **React 19** |
| Styling | **Tailwind CSS v4** (config in `app/globals.css`) |
| Language | **TypeScript** |
| LLM | **Groq** (`llama-3.3-70b-versatile`) for chat + assessor |
| Embeddings | **Google Generative AI** (`gemini-embedding-001`) |
| Vector DB | **Supabase** + **pgvector** |
| 3D globe | **react-globe.gl** + **three** |
| Markdown | **react-markdown** + **remark-gfm** |
| Email | **Resend** (transactional outbound from `hello@marcuspff.com`) |
| Anti-bot | **Cloudflare Turnstile** (Managed widget) |
| Telemetry | **Vercel Analytics** + **Vercel Speed Insights** |

## RAG chatbot

The chatbot answers questions using a vector retrieval pipeline rather than a
single static system prompt — so it scales with new content (projects, trips,
courses, course-blog posts) without prompt rewrites.

### Pipeline
1. User query is embedded with `gemini-embedding-001`.
2. Embedding is matched against the Supabase `document_chunks` table via the
   `match_document_chunks` RPC (`match_threshold: 0.2`, `match_count: 15`).
3. Top-15 chunks are concatenated and injected into the Groq Llama-3.3-70B
   system prompt alongside a tiny static anchor (name + roles + status).
4. Groq streams the response back; the homepage's `HeroQA` component renders
   it as a single Q&A response (each new question replaces the previous).

### Knowledge sources (re-embedded on every relevant push)
- `marcus.md` — long-form bio
- `lib/data.ts` — `personalDetails`, `skillGroups`, `projects`, `classes`
- `lib/trips.ts` — every trip (each trip becomes 2 chunks: summary + story)
- `content/course-blogs/*.md` — per-course blog markdown

### Embedding automation
GitHub Actions workflow `.github/workflows/update-embeddings.yml` re-runs
`scripts/embed.ts` on every push to `main` that touches `marcus.md`,
`lib/data.ts`, `lib/trips.ts`, `scripts/embed.ts`, or `package.json`. The
chatbot in production sees new data within ~60 seconds of merge.

## Contact form

A spam-hardened form on the homepage (`components/ContactForm.tsx`) that posts
to `app/api/contact/route.ts`. Eight layers of defense:

1. **Honeypot field** — silently 200s when bots fill the hidden `website` input.
2. **Min fill time** — rejects sub-3s submissions.
3. **Max fill time** — rejects stale (>1 h) form sessions.
4. **URL-count cap** — rejects messages with more than 2 links.
5. **Cloudflare Turnstile** — server-side `siteverify` against the secret key.
6. **Per-IP rate limit** — 3 / 10 min, 10 / 24 h (`lib/rate-limit.ts`).
7. **Global daily cap** — 50 / day total emails.
8. **Origin allowlist** — `lib/api-security.ts` rejects browser requests from
   any origin not in `{localhost:3000, localhost:3001, marcuspff.com,
   www.marcuspff.com}`.

Mail goes out via Resend from `Marcus Forsberg <hello@marcuspff.com>` (custom
domain verified in Resend with DKIM/SPF/DMARC) to the personal Gmail. Reply-To
is set to the submitter's email so hitting reply in Gmail goes back to them.

Inbound mail to `*@marcuspff.com` is forwarded by **ImprovMX** (free MX-based
service) to the same Gmail. Resend handles outbound, ImprovMX handles inbound;
they live on different DNS records (TXT vs MX) and don't conflict.

## Local setup

Node 20+ recommended.

```bash
git clone https://github.com/MarcusPFF/portfolio.git
cd portfolio
npm install
```

Create `.env.local` (full set):

```env
# Supabase (RAG vector DB)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Embeddings + chat fallback
GOOGLE_GENERATIVE_AI_API_KEY=...

# LLM completion (chat + assessor)
GROQ_API_KEY=...
GROQ_COURSE5_API_KEY=...                # separate key for the assessor

# Contact form (Resend + Turnstile)
RESEND_API_KEY=re_...
CONTACT_FROM_EMAIL="Marcus Forsberg <hello@marcuspff.com>"
CONTACT_TO_EMAIL=marcus.pff03@gmail.com  # optional, default shown
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
```

Run:

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
npm run embed    # re-embed knowledge into Supabase (manual)
npm run geocode  # resolve trip waypoint coords via Nominatim
```

## Project structure

```
app/
  api/
    chat/route.ts             # RAG chat — Supabase retrieval + Groq stream
    contact/route.ts          # Resend send + Turnstile + 8-layer defense
    llm/assess/route.ts       # Course 5+6 — structured assessor
  llm/
    page.tsx                  # Class timeline
    course3/page.tsx          # Meditations quiz wrapper
    course-5/page.tsx         # Assessor wrapper
    [course]/blog/page.tsx    # Dynamic Markdown blog with sidebar timeline
  trips/
    page.tsx                  # Trip list + 3D globe toggle
    [slug]/page.tsx           # Trip detail with sticky year sidebar
  layout.tsx                  # Metadata, OG, Twitter Card, JSON-LD, skip-to-content
  sitemap.ts                  # /sitemap.xml — built from trips + classes
  robots.ts                   # /robots.txt
  opengraph-image.tsx         # auto-generated 1200×630 OG image
  globals.css                 # Tailwind v4 + view transitions + section styles

components/
  GlassNav.tsx, GlassHero.tsx, GlassProjects.tsx, GlassSkills.tsx, GlassContact.tsx
  HeroQA.tsx                  # inline Q&A chat input on homepage
  ContactForm.tsx             # contact form with Turnstile + honeypot
  ChatWidget.tsx              # corner-mounted chat (used on /llm and /trips)
  ChatWidgetLazy.tsx          # dynamic-import wrapper (ssr: false)
  TypewriterRoles.tsx         # rotating role cycler
  LLMTimeline.tsx, Course3Quiz.tsx, Course5Assessor.tsx
  TripsListClient.tsx, TripDetailClient.tsx,
  TripsGlobe.tsx, TripsGlobeInner.tsx, TripsLangSwitcher.tsx, useTripsLang.ts
  ScrollReveal.tsx

lib/
  data.ts                     # personalDetails, skillGroups, projects, classes
  trips.ts                    # Trip type + array + waypoint helpers
  cityCoords.json             # Nominatim cache for trip waypoints
  course3Data.ts              # Quiz sections + questions
  rate-limit.ts               # Chat + contact rate limiters
  api-security.ts             # Origin allowlist for API routes
  tripsI18n.ts                # EN/DK/DE strings for /trips

scripts/
  embed.ts                    # Build chunks → Supabase
  geocode.ts                  # Nominatim lookup + per-trip distance

content/course-blogs/
  course1.md, course2.md, course4.md, course5.md
                              # Per-course blog content rendered via /llm/<slug>/blog

public/trips/
  earth-16k.jpg, earth-8k.jpg, earth-2k.jpg
                              # Multi-tier earth textures (16K desktop / 8K capable
                              # mobile / 2K constrained mobile, picked at runtime)
  earth-topology-4k.jpg, earth-water.png
  borders.geojson             # Natural Earth political borders

.github/workflows/
  update-embeddings.yml       # Auto re-embed on push to main
```

## Security & SEO

- **Headers** (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- **Origin allowlist** on all three API routes via `lib/api-security.ts`.
- **No `dangerouslySetInnerHTML`** in user content — only static JSON-LD.
- **Prompt-injection defense** on the assessor (system prompt instructs the
  model to ignore overrides inside the `[STUDENT SUBMISSION]` block).
- **Sitemap** auto-generated from trip + course data at `/sitemap.xml`.
- **OG image** generated at build time via `next/og`.
- **Person JSON-LD** in `app/layout.tsx` for structured data.

## Deployment

Hosted on **Vercel**. Static routes are built; dynamic routes are
`/api/chat`, `/api/contact`, `/api/llm/assess`. All env vars from the local
setup section need to exist in Vercel's project settings before deploy.

DNS for `marcuspff.com` is registered at Simply but uses Vercel nameservers
(`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). MX records point at ImprovMX
for inbound mail forwarding; TXT records (DKIM/SPF/DMARC) on `send.marcuspff.com`
authenticate Resend's outbound mail.
