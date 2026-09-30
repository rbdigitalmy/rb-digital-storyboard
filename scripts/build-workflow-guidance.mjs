import { readdir, readFile, writeFile } from 'node:fs/promises';

// Package the existing authored workflows for the protected MCP endpoint.
const root = 'rb-digital-storyboard-suite/skills';
const guidance = {};
for (const name of await readdir(root)) {
  if (name === 'setup') continue;
  guidance[name] = await readFile(`${root}/${name}/SKILL.md`, 'utf8');
}
await writeFile('supabase/functions/_shared/workflow-guidance.json', JSON.stringify(guidance));
