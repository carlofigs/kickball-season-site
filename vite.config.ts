import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** GitHub Pages project site: https://<user>.github.io/<repo>/ — must match the repo name. */
const GITHUB_PAGES_BASE = '/kickball-season-site/';

export default defineConfig(({ command }) => ({
  root: '.',
  /** Dev uses `/` so manifest and icons work at `localhost`; build keeps the Pages subpath. */
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
  plugins: [
    tailwindcss(),
    react({
      babel: {
        // Must run before other Babel transforms — see https://react.dev/learn/react-compiler/installation
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
}));
