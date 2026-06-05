import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexPath = path.join(repoRoot, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const match = html.match(/<script type="module">([\s\S]*?)<\/script>\s*<\/body>/i);

if (!match) {
    console.error('Could not find the main <script type="module"> block in index.html.');
    process.exit(1);
}

const tempPath = path.join(os.tmpdir(), `jkp-index-module-${process.pid}-${Date.now()}.mjs`);

try {
    fs.writeFileSync(tempPath, match[1], 'utf8');
    const result = spawnSync(process.execPath, ['--check', tempPath], { stdio: 'inherit' });
    if (typeof result.status === 'number') {
        process.exit(result.status);
    }
    console.error('Module syntax check did not return an exit status.');
    process.exit(1);
} finally {
    fs.rmSync(tempPath, { force: true });
}
