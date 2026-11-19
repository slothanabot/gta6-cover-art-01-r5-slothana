// Neon Grid Cover Studio — entry program (gta6-cover-art-01, round 5).
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from the
// kit's library (vendor/makefun-frontend.ts, the scorer's own library,
// copied byte-for-byte). Runs under Node 22+ as `node main.ts`.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });

cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`Neon Grid Cover Studio entry written to ${outDir}`);
