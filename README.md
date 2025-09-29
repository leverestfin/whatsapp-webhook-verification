
# WhatsApp Webhook Verification (Vercel + GitHub)

This is a tiny project that verifies your WhatsApp Cloud API webhook using a **Vercel Serverless Function**.

## Quick start

1. **Create a GitHub repo** and upload this folder.
2. Go to **vercel.com** → **New Project** → Import your GitHub repo.
3. In Vercel → **Settings → Environment Variables**, add:
   - `VERIFY_TOKEN` = the same token you will enter in Meta (e.g., `mysecret`).
4. Deploy. Your webhook URL will look like:
   ```
   https://<your-app>.vercel.app/api/webhook
   ```
5. In **Meta Developer Console** → **WhatsApp → Configuration**:
   - Callback URL: your Vercel URL above
   - Verify Token: the same value you set in Vercel (e.g., `mysecret`)
6. Click **Verify and Save**.

### Test locally (optional)
Not required. Vercel hosts it for you. If you do run locally, you need a public tunnel like ngrok.

## Files
- `api/webhook.js` — handles `GET` (verification) and `POST` (events).

## Manual test
Open in a browser:
```
https://<your-app>.vercel.app/api/webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=mysecret
```
If your token matches, it should respond with `123`.
