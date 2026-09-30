# RB Digital Storyboard Suite

Version 0.2.0 combines 19 packaged workflow Skills with the hosted RB Digital
MCP server and ChatGPT Extension UI.

## Hosted connection

- Portal: `https://rbdigitalmy.github.io/rb-digital-storyboard/`
- MCP transport: `https://klxzpyzgljvmsepvjhaz.supabase.co/functions/v1/mcp-server`
- OAuth: Supabase Auth OAuth 2.1 with authorization code + PKCE
- UI: sidebar, thread panel, native settings, and visual workflow picker
- Access control: server-side entitlement and atomic credit checks

Install the complete `rb-digital-storyboard-suite` directory as one plugin.
The onboarding skill will guide account connection and verify access.

Plugin ini menggabungkan 19 workflow Custom GPT milik RB Digital dengan MCP server, OAuth dan Extension UI yang dihoskan melalui GitHub Pages + Supabase.

## Skill yang disertakan

- Cartoon Storyboard
- Character Sheet
- Kawaii Image
- OOTD
- Poster
- Real Human
- Real Product
- Realtoon
- Storyboard Anthropomorphic
- Storyboard ASMR
- Storyboard Chibi
- Storyboard Grafix
- Storyboard Pix
- Storyboard Podcast
- Storyboard POV Hand
- Storyboard Stop Motion
- Storyboard Talking Head
- Storyboard Universal
- Thumbnail

Setiap workflow berada dalam folder skill tersendiri supaya Codex boleh memilih arahan yang tepat berdasarkan permintaan pengguna.

## Status

- Version: 0.2.0
- Author: Najib
- Format: Agent Plugins 1.0
- Visibility selepas dicipta: Private
- MCP: Supabase Edge Function (Streamable HTTP)

## Penggunaan dan perkongsian

Keseluruhan folder ini ialah satu plugin mudah alih. Ia boleh dizip untuk import sebagai plugin peribadi atau disimpan dalam repositori Git untuk dikongsi dengan pasukan. Mengezip atau berkongsi sumber ini tidak menerbitkannya ke Plugins Directory.

Sebelum versi pertama dimuat naik, semak nota kandungan yang dibekalkan bersama pakej. Selepas sebarang perubahan, naikkan nombor versi dalam `plugin.json`.
