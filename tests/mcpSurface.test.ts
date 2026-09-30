import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const MCP_ENDPOINT = 'https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server';

describe('Supabase MCP surface', () => {
  it('allows OAuth discovery before bearer-token validation', async () => {
    const config = await readFile('supabase/config.toml', 'utf8');
    const source = await readFile('supabase/functions/mcp-server/index.ts', 'utf8');
    assert.match(config, /\[functions\.mcp-server\][\s\S]*verify_jwt\s*=\s*false/);
    assert.match(source, /protectedResourceMetadata/);
    assert.match(source, /authenticateRequest/);
    assert.match(source, /oauthChallenge/);
  });

  it('ships the Supabase MCP endpoint in the plugin manifest', async () => {
    const manifest = JSON.parse(await readFile('rb-digital-storyboard-suite/plugin.json', 'utf8'));
    const mcpConfig = JSON.parse(await readFile('rb-digital-storyboard-suite/mcp.json', 'utf8'));
    assert.equal(manifest.version, '0.2.0');
    assert.ok(manifest.extensions['com.openai'].interface.shortDescription.length <= 30);
    assert.equal(mcpConfig.mcpServers['rb-digital-storyboard'].url, MCP_ENDPOINT);
  });

  it('contains no Netlify endpoint in the production plugin package', async () => {
    const files = [
      await readFile('rb-digital-storyboard-suite/mcp.json', 'utf8'),
      await readFile('rb-digital-storyboard-suite/README.md', 'utf8'),
    ];
    assert.equal(files.some((file) => file.includes('netlify.app')), false);
  });
});
