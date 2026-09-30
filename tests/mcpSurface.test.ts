import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const MCP_ENDPOINT = 'https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server';

describe('Supabase MCP surface', () => {
  it('keeps the website minimal while preserving the OAuth consent route', async () => {
    const app = await readFile('src/App.tsx', 'utf8');
    const home = await readFile('src/pages/Home.tsx', 'utf8');
    assert.match(app, /path="\/oauth\/consent"/);
    assert.doesNotMatch(app, /AuthProvider|AdminDashboard|StoryboardStudio|BuyCreditsModal/);
    assert.match(home, /supabase.auth.getUser/);
    assert.match(home, /from\('entitlements'\)/);
    assert.match(home, /account\?\.active && <section/);
    assert.match(home, /shouldCreateUser: true/);
    assert.match(home, /review_access_request/);
    assert.match(home, /navigator.clipboard.writeText\(mcpUrl\)/);
    assert.doesNotMatch(home, /mockData|credit_wallets|consume_storyboard_credits/);
  });
  it('uses purchase-gated ChatGPT instructions without credit charging or server generation', async () => {
    const source = await readFile('supabase/functions/mcp-server/index.ts', 'utf8');
    assert.doesNotMatch(source, /consume_storyboard_credits|credit_wallets|generateStoryboard\(/);
    assert.match(source, /if \(!access.access_granted\) return errorToolResult/);
    assert.match(source, /generation_mode: "chatgpt"/);
    const guidance = JSON.parse(await readFile('supabase/functions/_shared/workflow-guidance.json', 'utf8'));
    assert.equal(Object.keys(guidance).length, 19);
    assert.ok(guidance['storyboard-universal'].includes('STORYBOARD RULES'));
  });
  it('allows OAuth discovery before bearer-token validation', async () => {
    const config = await readFile('supabase/config.toml', 'utf8');
    const source = await readFile('supabase/functions/mcp-server/index.ts', 'utf8');
    assert.match(config, /\[functions\.mcp-server\][\s\S]*verify_jwt\s*=\s*false/);
    assert.match(source, /protectedResourceMetadata/);
    assert.match(source, /authenticateRequest/);
    assert.match(source, /securitySchemes:\s*oauthSecuritySchemes/);
    assert.match(source, /mcp\/www_authenticate/);
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
