# LPT Studio website

Plain HTML/CSS/JS — no build step, no framework, no dependencies. Every page is a normal `.html` file, so you can open `index.html` directly in a browser to preview, and edit it in Xcode, VS Code, or anything else.

## Structure

```
index.html          Home
services.html        Services
portfolio.html        Work (listing + filter)
portfolio/
  flexle.html          Case study
  full-window.html      Case study
  credits.html          Case study
  volume-plus.html       Case study
about.html            About
contact.html          Start a Project (enquiry form)
404.html             Custom not-found page
css/style.css         All styles (design tokens at the top)
js/main.js            Nav, animations, filters, form handling
```

## Adding a new portfolio project

1. Copy `portfolio/flexle.html` to `portfolio/your-project.html`.
2. Update the `<title>`, hero heading/description, meta row (role, platform, stack, status), and the five body sections (idea, role, design, tech, outcome).
3. Add a matching row to `portfolio.html` (copy one `work-row` block) and, if you want it on the homepage too, to `index.html`.
4. Set `data-category` on the new row to `app`, `tool`, or `website` so the filter chips on the Work page pick it up.

## Adding a new service or page

Copy the closest existing page and update the `<nav>` `active` class, the content, and the footer links (they're identical across every page — search-and-replace friendly).

## Wiring up the contact form

The form on `contact.html` currently falls back to opening a pre-filled email to `liam@lpt-studio.co.uk` (update that address in `js/main.js` and the footer once you've decided on it). To make it submit properly instead, in `js/main.js` set the `ENDPOINT` constant near the top of the `#project-form` handler to a real backend URL. A couple of options that fit what you're already using elsewhere:

- **Supabase + Resend** (matches the Flexle stack): create a `contact_enquiries` table, add a Supabase Edge Function that inserts the row and sends you a notification email via Resend, then point `ENDPOINT` at that function's URL.
- **Formspree / Netlify Forms**: no backend code needed — create a form endpoint with either service and point `ENDPOINT` at it. Simplest option if you don't want to touch Supabase for this.

Either way, keep the existing client-side validation and status messages — only the `fetch` target needs to change.

## Deploying

This is a static site, so it will work on: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any standard web host you point `lpt-studio.co.uk` at. There's no build command — just upload the contents of this folder (or connect the repo) and set the domain.

If you deploy to GitHub Pages, add a `CNAME` file containing `lpt-studio.co.uk` to the root of this folder before pushing.

## Backend / admin (Phase 1)

The site is gaining a Supabase-backed CMS so you can edit content without touching code. Phase 1 covers: Home page hero content, the contact form (now submits straight into the database), and an enquiries inbox. Services and portfolio editing come in Phase 2.

### 1. Create a Supabase project

Use a **new** Supabase project dedicated to this website — keep it separate from the Flexle project. Free tier is plenty for a brochure site.

### 2. Run the schema

In the Supabase SQL editor, run `db/schema.sql`, then `db/seed.sql` (seed just fills in the current homepage text so the admin form isn't blank).

### 3. Create your admin login

Supabase Dashboard → Authentication → Users → **Add user**. Use your own email and a password. This is the only account that will ever be created — sign-ups aren't exposed anywhere on the public site.

### 4. Add your project keys

In `js/supabase-client.js`, replace:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

with the values from Project Settings → API. The anon key is safe to expose client-side — it can only do what the RLS policies in `db/schema.sql` allow (public read, public insert on enquiries only, everything else requires your admin login).

### 5. Log in

Visit `admin/login.html` on your deployed site (or locally) and sign in. From the dashboard you can edit the homepage hero and view/manage enquiries. Note: because the admin pages use ES module imports, opening them via `file://` directly won't work for the Supabase calls — run a local server (e.g. `npx serve` from this folder, or VS Code's "Live Server") while testing locally, and it'll work fine once deployed properly to a real host.

### How the fallback works

Every page keeps its current static text as a fallback baked into the HTML. On load, a small script tries to fetch the live content from Supabase and swap it in — if that fails (offline, database down, not configured yet), visitors just see the static version. The site never breaks because of this.



- All portfolio "screenshots" are hand-built SVG mockups, not real screenshots, since none were supplied. Swap the `<svg>` inside each `.work-visual` / `.case-visual-hero` for a real image (`<img src="...">`) whenever you have one — the surrounding layout won't need to change.
- The email address `liam@lpt-studio.co.uk` is a placeholder — update it in `js/main.js`, `contact.html`, and every page footer once you've set up a real inbox on the domain.
- Testimonials, a blog/articles section, and package pricing were intentionally left out per the brief — the layout (see `.section-alt`, `.benefits-grid`, `.service-card`) makes it straightforward to add a matching section later.
