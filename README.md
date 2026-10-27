# Rana Ads Tracking — starter project

This is a starter scaffold for a Telegram + landing-page event tracker. It is **not production-ready until configured and tested**. It records landing page visits/button clicks and Telegram join-request/member updates. It does not yet claim that a Telegram join is matched to a specific Meta ad click; reliable matching needs a per-visitor invite-link/correlation flow and Meta CAPI configuration.

## Files
- `public/index.html` — mobile-first landing page
- `api/track.js` — saves page-view and click events
- `api/telegram-webhook.js` — receives Telegram join request/member updates
- `api/admin-summary.js` — protected JSON summary endpoint
- `sql/schema.sql` — Supabase tables
- `.env.example` — required environment variables

## Setup outline
1. Create a Supabase project and run `sql/schema.sql` in its SQL Editor.
2. In Supabase, add a row in `channels` with a unique `slug`, `name`, and Telegram channel numeric ID (usually starts with `-100`). The bot must be an administrator in that channel with permission to invite users/manage join requests.
3. Import this folder into a **private** GitHub repository and import the repository into Vercel.
4. Add environment variables from `.env.example` in Vercel Project Settings → Environment Variables. Never put secrets in HTML or commit them to GitHub.
5. Deploy, then set the Telegram webhook to `https://YOUR-DOMAIN/api/telegram-webhook` with the same `TELEGRAM_WEBHOOK_SECRET` as Telegram's `secret_token`. Telegram Bot API `setWebhook` accepts `allowed_updates` including `chat_join_request` and `chat_member`.
6. The landing page needs its actual channel-specific invite link configured before use. Do not run ads to the placeholder page.
7. Test with a private/test channel and Meta Events Manager Test Events before spending ad budget.

## Current limitations
- Landing page currently uses a placeholder click handler rather than a real invite URL.
- Channel creation/configuration UI and Telegram bot command handler are not implemented yet.
- Admin summary is a protected JSON endpoint, not a finished graphical admin panel.
- Meta Pixel browser code and Meta Conversions API delivery are not implemented yet. Do not report CAPI events as sent until implemented and tested.
- Per-person ad attribution requires unique Telegram invite links and a persisted mapping between landing-page session/click IDs and the invite link, then reading that invite link from Telegram updates. `fbclid` alone does not prove a join came from Meta.
- Use privacy notice/consent appropriate to your audience and never publish Telegram user IDs/usernames in public reports.
