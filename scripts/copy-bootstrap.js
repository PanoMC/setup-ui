import { existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';

const bootstrapOutDir = './static/lib/bootstrap';
if (existsSync(bootstrapOutDir)) rmSync(bootstrapOutDir, { recursive: true, force: true });
mkdirSync(bootstrapOutDir, { recursive: true });

const bootstrapSrc = './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
const bootstrapDest = bootstrapOutDir + '/bootstrap.bundle.min.js';

if (existsSync(bootstrapSrc)) {
  copyFileSync(bootstrapSrc, bootstrapDest);
  console.log('Copied Bootstrap bundle to static/lib/bootstrap/');
} else {
  console.warn('Bootstrap bundle not found at:', bootstrapSrc);
}
