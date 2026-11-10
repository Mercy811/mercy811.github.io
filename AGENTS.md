# Publishing language rule

Before publishing any page or article, run `npm run build`. The build includes the mandatory automated language-consistency check.

- A page containing only English content stays English-only.
- Any page that is also available in Chinese must provide an English/中文 language toggle.
- Bilingual pages must default to English on every fresh page load.
- English mode must show only English interface and editorial copy. Chinese mode must show only Chinese interface and editorial copy. Brand names and unavoidable proper nouns are exempt.
- The page title, description, navigation, controls, dates, labels, body copy, links, and footer must switch together. Never publish a page with English and Chinese editorial copy visible at the same time.
- For bilingual ThaiCue notes, provide both `en` and `zh` metadata/content and verify both modes before pushing.

# Publishing workflow

There is no staging or production separation. The live site is whatever is on the default branch.

When a change is ready:

1. Run `npm run build`. Fix anything it reports.
2. Check the affected pages locally (`npm run dev` or `npm run preview`), including both thoughts views and both languages when a page is bilingual.
3. Commit and push directly to `master` on the remote. Do not open a pull request.
4. GitHub Pages deploys from that push. It can take a minute or two. Rollback is `git revert`, then push `master` again.

# Adding a blog post

Posts are static pages. The thoughts index collects them at build time. No manual list to update.

## Where the file goes

- Workbench essays: `src/pages/thoughts/<kebab-case-slug>.md`, rendered with `src/layouts/Note.astro`.
- Notes that belong to a project journal: `src/pages/projects/<project>/notes/<kebab-case-slug>.astro` (or `.md`). ThaiCue notes use `src/layouts/ThaiCueNote.astro` and must stay bilingual.
- A project journal such as `src/pages/projects/thaicue/index.astro` keeps its own list by globbing its `notes/` folder. A note in that folder appears there and in the site-wide thoughts index.

Name the file from the title: lowercase, hyphenated, no dates in the filename. The URL is the path under `src/pages/`.

## Front matter

Markdown essays:

```yaml
---
layout: ../../layouts/Note.astro
title: Analytics is less about events than state transitions
description: One or two sentences used as the note deck.
summary: Optional shorter teaser for the homepage cards. Omit it to reuse description.
date: September 2026
published: "2026-09-03"
order: 2
project: Engaged dwell
projectHref: https://mercy811.github.io/amplitude-engaged-dwell-poc/
topic: Analytics systems
readingTime: 6 min
---
```

Astro journal notes export the same fields as `note` (ThaiCue also needs `titleZh`, `descriptionZh`, `dateZh`, `topicZh`, `readingTimeZh`).

Required on every note:

- `title`, `description`, `date` — `date` is the prose label, such as `September 2026`.
- `published` — `"YYYY-MM-DD"`, quoted so it stays a date string. This is the chronology. The timeline sorts newest first and prints the day from this value.
- `project` — the work the note belongs to, written the way it should appear as a heading (`ThaiCue`, `Engaged dwell`, `Domain gating`). Notes with the same `project` string form one group. The build fails if `project` or `published` is missing.

Optional:

- `order` — number. When two notes share a `published` date, the higher `order` appears first. The ThaiCue journal uses the same rule. Omit it unless there is a tie.
- `projectHref` — one shared link for the project group (`/projects/thaicue/` or an absolute `https://` URL). Every note in a project must use the same href. The build fails if they disagree.
- `summary` — homepage and index teaser. Falls back to `description`.
- `topic`, `readingTime` — homepage card eyebrow (`Analytics architecture · 7 min`).

## What the two views show

`src/lib/posts.ts` loads `src/pages/thoughts/**/*.md` and `src/pages/projects/**/notes/**/*.{md,astro}`. Markdown contributes its front matter. Astro notes contribute the exported `note` object. `src/pages/thoughts/index.astro` renders that list.

- **By project** is the default at `/thoughts/`. Groups are ordered by their newest note. Notes inside a group are newest first. `projectHref` becomes the group's "Open project" link.
- **Timeline** is the same page with `?view=timeline`. Notes run newest first, with a date rail. The pill switch in the page header (same slot as the language toggle on journal pages) changes the view without a reload.
- The homepage "Working thoughts" section shows the two newest essays that live in `src/pages/thoughts/`, plus a link to `/thoughts/`. Project-journal notes stay on their project page and in the thoughts index, so they do not pile onto the homepage.

A new file in either location appears in both views on the next build. Do not hand-maintain a second list.

# Visual and structural conventions

Match the existing site. Do not introduce a new palette, type system, or layout.

- Pages use `src/layouts/Base.astro`. It supplies the wordmark, nav, footer, and fonts: Newsreader for headlines, Manrope for body, DM Mono for nav, eyebrows, and meta.
- Colors live on `:root` in the base layout: paper `#f3f0e8`, ink `#151a17`, muted `#5f665f`, card `#fbf9f3`, line `#c9cec4`, acid `#d8ff63`, violet `#7467ff`, orange `#ff7043`. ThaiCue notes and the ThaiCue journal use `#8ed8ff` as their accent. Site-wide thoughts use acid and violet.
- Eyebrows are 11px mono, uppercase, tracked out, muted. Headlines are serif with tight line-height and a small negative letter-spacing. Body copy stays in the existing size and color.
- Index pages use the `.shell` width. Essays use the `.prose` column. Back links are 11px mono and muted. The thoughts index links essays back to `/thoughts/`. The thoughts index links home with "← Back to the workbench".
- The view switch and the language toggle are the same pill: ink border, full radius, pressed state ink on paper. Do not invent a second control style.
- Cards and rows are flat. Separation is a 1px line, not a shadow, except where a page already uses the offset acid shadow (signal card, demo frames).
- Keep the homepage rhythm: hero, ticker, work list, a short thoughts grid, about. Do not dump every note onto the homepage.
- Mobile breakpoints follow the current pages (about 700px and 600px). Stack grids, let the header keep the wordmark and GitHub link, and keep the view switch on the page because the primary nav links hide on small screens.
- English-only pages stay free of Chinese copy. Bilingual pages follow the language rule above.
