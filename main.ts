// Vice Cover Studio — make.fun program/v1 entrypoint.
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with the kit's buildDossier (vendor/makefun-app.ts).
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
// Runs with plain `node main.ts`: erasable TypeScript only, no build step.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

rmSync(join(outDir, "app"), { recursive: true, force: true });
rmSync(join(outDir, "screenshots"), { recursive: true, force: true });
rmSync(join(outDir, "dossier.json"), { force: true });
mkdirSync(outDir, { recursive: true });

cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
console.log("Vice Cover Studio handed in to " + outDir);
