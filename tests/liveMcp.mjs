const response = await fetch('https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
});
const body = await response.text();
if (!response.ok || !body.includes('This tool does not generate AI content or charge credits')) throw new Error(`Live MCP verification failed: ${response.status}`);
console.log('Live MCP exposes purchase-gated ChatGPT guidance, not credit-based generation.');
