# Email (Resend) — Vivaboss Fusion

Every operational event emails **admin@vivabossfusion.co.uk** (hard-coded default in `adminNotifyEmails()`). Extra addresses can be added via env.

## Events → admin inbox

| Event | Customer email | Admin email |
|---|---|---|
| Order paid | Receipt | New order |
| Custom request submitted | Received | New request |
| Service job submitted | Received | New job |
| Courier job submitted | Received | New job |
| Contact form | Received | New message |

## Env vars

```env
RESEND_API_KEY=re_xxxxxxxx
# Until vivabossfusion.co.uk is verified in Resend, use:
RESEND_FROM_EMAIL=Vivaboss Fusion <onboarding@resend.dev>
# After domain verify, prefer:
# RESEND_FROM_EMAIL=Vivaboss Fusion <noreply@vivabossfusion.co.uk>

# Always notified (code default). Optional extras, comma-separated:
ADMIN_NOTIFICATION_EMAIL=admin@vivabossfusion.co.uk
```

## Setup checklist

1. Create a [Resend](https://resend.com) account  
2. Add API key → `RESEND_API_KEY` in `.env.local` and Vercel  
3. (Go-live) Verify `vivabossfusion.co.uk` and switch `RESEND_FROM_EMAIL`  
4. Confirm `admin@vivabossfusion.co.uk` can receive mail (Resend test or real order)  

Without `RESEND_API_KEY`, APIs still save bookings/orders, but **no emails send**.
