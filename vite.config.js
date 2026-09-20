import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `frontend/` stays the Vite root so the Vercel project's Root Directory and
// frontend/vercel.json keep working untouched. Output goes to dist/, which is
// what both Vercel and backend/server.js now serve.
// Social metadata needs an ABSOLUTE origin: scrapers do not resolve
// root-relative og:image reliably. Vite's own %VAR% substitution leaves the
// literal token in place when the variable is unset, which would ship
// `href="%VITE_SITE_ORIGIN%/"` to production. This plugin substitutes it
// explicitly and shouts when it is missing rather than failing silently.
const siteOrigin = () => ({
  name: 'keystone-site-origin',
  transformIndexHtml(html) {
    const origin = (process.env.VITE_SITE_ORIGIN || '').replace(/\/+$/, '');
    if (!origin) {
      console.warn(
        [
          '',
          '  [keystone] VITE_SITE_ORIGIN is not set.',
          '  og:url, og:image and canonical will be emitted root-relative, which',
          '  most social scrapers will not resolve. Set it to the public origin',
          '  (e.g. VITE_SITE_ORIGIN=https://your-domain.com) in the Vercel',
          '  project environment and rebuild.',
          '',
        ].join('\n')
      );
    }
    return html.replaceAll('%VITE_SITE_ORIGIN%', origin);
  },
});

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [react(), siteOrigin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // Explicit modern targets. The default CSS target is conservative enough
    // that the minifier rewrote `backdrop-filter` to the -webkit- alias ONLY,
    // dropping the standard property and silently killing every glass surface
    // on the site. These targets all support it unprefixed.
    target: 'es2022',
    cssTarget: ['chrome111', 'edge111', 'firefox113', 'safari16.4'],
  },
  server: {
    port: 5173,
    // Lets `npm run dev` talk to a locally running backend without a build.
    proxy: { '/api': 'http://localhost:8080' },
  },
});
