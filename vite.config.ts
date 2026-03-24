import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** GitHub Pages project site: https://<user>.github.io/<repo>/ — must match the repo name. */
const GITHUB_PAGES_BASE = '/kickball/';

export default defineConfig({
  root: '.',
  base: GITHUB_PAGES_BASE,
  plugins: [tailwindcss(), react()],
});
