// Assembles dist/: the explainer page plus the Wispr Flow guide, so one deploy publishes both.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const here = fileURLToPath(new URL('.', import.meta.url));
rmSync(join(here, 'dist'), { recursive: true, force: true });
mkdirSync(join(here, 'dist'), { recursive: true });
cpSync(join(here, 'public'), join(here, 'dist'), { recursive: true });
cpSync(join(here, '..', 'issue-4-wispr-flow-guide'), join(here, 'dist', 'wispr-flow-guide'), { recursive: true });
console.log('built dist/');
