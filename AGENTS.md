# Publishing language rule

Before publishing any page or article, run `npm run build`. The build includes the mandatory automated language-consistency check.

- A page containing only English content stays English-only.
- Any page that is also available in Chinese must provide an English/中文 language toggle.
- Bilingual pages must default to English on every fresh page load.
- English mode must show only English interface and editorial copy. Chinese mode must show only Chinese interface and editorial copy. Brand names and unavoidable proper nouns are exempt.
- The page title, description, navigation, controls, dates, labels, body copy, links, and footer must switch together. Never publish a page with English and Chinese editorial copy visible at the same time.
- For bilingual ThaiCue notes, provide both `en` and `zh` metadata/content and verify both modes before pushing.
