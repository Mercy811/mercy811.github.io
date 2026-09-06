import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mercy811.github.io',
  output: 'static',
  redirects: {
    '/thoughts/building-thai-song-learner': '/projects/thaicue/notes/building-the-tool-i-wanted',
  },
});
