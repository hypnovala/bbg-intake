# The Brock Book Guide — Intake Form

A self-contained interactive intake form that matches the printed PDF. The client
fills it out, a branded PDF of their answers is generated in the browser, and it's
emailed to you (with the PDF attached) via Resend.

## Files

```
index.html          ← the form (self-contained: fonts + jsPDF via CDN)
api/send-email.js    ← Vercel serverless function that sends the email (Resend)
```

## Deploy (GitHub → Vercel import)

The `/api` route needs the **GitHub import** flow — drag-and-drop won't wire up the function.

1. Put `index.html` and the `api/` folder in a repo (e.g. `hypnovala/bbg-intake`)
   using GitHub's web "Add file → Upload files."
2. In Vercel: **Add New → Project → Import** that repo. No build step, no framework — deploy as-is.
3. Add the environment variables below, then redeploy.
4. (Optional) Point a subdomain at it, e.g. `guide.brockjohn.com`.

## Environment variables (Vercel → Settings → Environment Variables)

| Name             | Example                                  | Notes |
|------------------|------------------------------------------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxx`                            | From resend.com |
| `TO_EMAIL`       | `hello@brockjohn.com`                    | Where reflections land (you) |
| `FROM_EMAIL`     | `Brock Book Guide <guide@brockjohn.com>` | Must be on a **verified** Resend domain |

> Resend's `onboarding@resend.dev` only delivers to the account owner — verify your
> `brockjohn.com` domain in Resend before going live so it reaches clients reliably.

## Graceful fallback

If the email function isn't reachable yet (or before you've added the keys), the form
still works: it shows the client a success screen with a **"Download your copy (PDF)"**
button and a mailto link, so nothing is lost while you finish wiring up Resend.

## Editing the questions

All nine questions live in the `QUESTIONS` array near the top of the `<script>` block in
`index.html`. Each is either `{type:"radio"}`, `{type:"checkbox", other:true}`, or
`{type:"text"}`. Add/remove options or change wording there — the PDF and email update
automatically.
