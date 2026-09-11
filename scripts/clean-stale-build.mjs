/**
 * Removes a production build sitting in `.next` before the dev server starts.
 *
 * `next build` and `next dev` share the `.next` directory. If a production
 * build is left there, the dev server comes up serving a client manifest that
 * references chunk filenames which do not exist on disk, and the first dynamic
 * import fails with:
 *
 *   ChunkLoadError: Loading chunk _app-pages-browser_components_three_... failed
 *
 * `BUILD_ID` is written by `next build` and never by `next dev`, so it is a
 * reliable marker for "this directory holds a production build". Checking for
 * it means the dev server's incremental cache survives the normal case and is
 * only discarded when it would actually be broken.
 */
import { existsSync, rmSync } from 'node:fs';

const DIST = '.next';
const PRODUCTION_MARKER = `${DIST}/BUILD_ID`;

if (existsSync(PRODUCTION_MARKER)) {
  rmSync(DIST, { recursive: true, force: true });
  console.log(`[dev] Cleared a stale production build from ${DIST}/`);
}
