---
name: setup
description: Connect an RB Digital account, verify a BCL purchase entitlement, and open the GPT Storyboard Studio after this plugin is installed.
---

# Set up RB Digital Storyboard

1. Call `get_my_access` to trigger the secure Supabase OAuth connection.
2. Ask the user to sign in with the email used for their RB Digital or BCL purchase.
3. After authorization, call `get_my_access` again.
4. If `access_granted` is true, open `open_storyboard_studio` and briefly state the available credit balance.
5. If access is not active, direct the user to the RB Digital portal returned by the server. Never claim access is active without the server result.

Do not request passwords, access tokens, Supabase keys, BCL API keys, or webhook secrets in chat.
