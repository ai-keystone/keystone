/* Pre-build step that survives a deploy sandbox.
 *
 * `scripts/build-frontend.js` lives at the repo root and syncs
 * backend/lib/renderPreferences.js into
 * frontend/src/lib/renderPreferences.generated.js. On Vercel the project's
 * Root Directory is `frontend`, so nothing above it exists in the build
 * sandbox: the old `prebuild: node ../scripts/build-frontend.js` failed
 * with MODULE_NOT_FOUND and took the whole deployment with it.
 *
 * Locally the generator runs as before, so the backend stays the source of
 * truth. In a sandbox it is simply absent, and the committed generated
 * file is used instead - which is why that file is no longer gitignored.
 * scripts/test-render-experience.js checks the frontend's copy against the
 * backend end to end, so drift between them still fails the suite.
 */
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const generator = resolve(here, '../../scripts/build-frontend.js');
const generated = resolve(here, '../src/lib/renderPreferences.generated.js');

if (existsSync(generator)) {
    execFileSync(process.execPath, [generator], { stdio: 'inherit' });
} else if (existsSync(generated)) {
    console.log('[keystone] repo-root generator not reachable (deploy sandbox); '
        + 'using the committed renderPreferences.generated.js');
} else {
    console.error('[keystone] no generator and no committed '
        + 'src/lib/renderPreferences.generated.js - the build will fail on its import.\n'
        + '           Run `node scripts/build-frontend.js` from the repo root and commit the result.');
    process.exit(1);
}
