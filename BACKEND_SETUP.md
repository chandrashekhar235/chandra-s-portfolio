# Production Serverless Contact Backend Architecture

A comprehensive guide for setting up and operating the serverless contact pipeline for Chandra Shekhar's AI systems portfolio. Submissions are persisted directly to **Supabase PostgreSQL** and trigger automated email alerts via **Resend**.

---

## 1. Architecture Overview

```
[ Visitor / Recruiter ]
         │
         ▼
[ Contact Form Component ]
  • Inquiry Type Selector (Career / Freelance / Student / Business / Other)
  • Dynamic Organization & Role fields
  • Client-side Zod validation & Honeypot trap
         │
         ▼ (POST /api/contact)
[ Next.js Route Handler ]
  1. Same-Origin & Host verification
  2. Request size limit (15KB)
  3. Honeypot check (silent 200 for bots)
  4. Server-side Zod schema validation
  5. SHA-256 IP-hashed rate limiter (max 5/hour via Supabase/Memory)
         │
         ▼ (PERSISTENCE FIRST)
[ Primary Storage Engine: Supabase PostgreSQL ]
  • Table: public.contact_messages
  • Protected by RLS (anonymous clients cannot read or modify records)
  • Server uses SUPABASE_SECRET_KEY exclusively
         │
         ▼ (NOTIFICATION SECOND)
[ Notification Dispatcher with Bounded Retries ]
  • Resend API (Transactional HTML/Text Email with sender's email in Reply-To)
  • Sent to CONTACT_TO_EMAIL (sahiljoshi399@gmail.com)
  • Updates message record in Supabase (status: 'sent' | 'failed', provider_message_id)
```

---

## 2. Security & Data Protection Guarantees

| Security Feature | Implementation | Guarantee |
| :--- | :--- | :--- |
| **Row Level Security (RLS)** | `ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;` + `REVOKE ALL ON public.contact_messages FROM anon, authenticated;` | Anonymous users cannot read, insert, update, or delete records directly. |
| **Server-Side Secret Key** | `SUPABASE_SECRET_KEY` is loaded only in server modules (`import 'server-only'`). | The secret key is never leaked to the browser or client bundle. |
| **Persistence First** | Database insertion executes and is confirmed **before** attempting email dispatch. | If database persistence fails, an HTTP 500 error is returned immediately and no false success claims are made. |
| **Notification Resilience** | If Resend encounters an outage or failure, the message is preserved in Supabase. | The database record is updated with `notification_status: 'failed'` and the error message is recorded. |
| **Spam & Abuse Defense** | Hidden `website` honeypot + IP hashing with SHA-256 (rate limited to 5 submissions/hour). | Zero bot messages pollute the database, and IP addresses are not stored in plaintext. |

---

## 3. Environment Variables

Configure these variables in `.env.local` for local development, and in **Vercel Project Settings &rarr; Environment Variables** for production:

```ini
# Supabase Configuration (Database Persistence)
NEXT_PUBLIC_SUPABASE_URL="https://kkzqqoeaxkdbamxdclfc.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_URL="https://kkzqqoeaxkdbamxdclfc.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_..."

# Resend Email Delivery
RESEND_API_KEY="re_..."
CONTACT_TO_EMAIL="sahiljoshi399@gmail.com"
CONTACT_FROM_EMAIL="Portfolio Contact <onboarding@resend.dev>"

# Optional Security / Notification Settings
IP_HASH_SALT="your_random_hex_salt"
CONTACT_WEBHOOK_URL=""
```

---

## 4. How to Inspect Submissions in Supabase

Because this architecture is fully serverless with no exposed admin portal:

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your **Portfolio** project (`kkzqqoeaxkdbamxdclfc`).
3. Click on **Table Editor** in the left sidebar and select `contact_messages`.
4. You will see all submitted inquiries with:
   - `created_at` (timestamp)
   - `inquiry_type` (`career`, `freelance`, `student`, `business`, `other`)
   - `name`, `email`, `organization`, `role`
   - `message` (inquiry text)
   - `notification_status` (`sent`, `failed`, or `pending`)
   - `provider_message_id` (Resend email delivery ID)
   - `email_sent` (boolean)
