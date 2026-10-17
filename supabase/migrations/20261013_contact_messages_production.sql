-- ==============================================================================
-- Migration: 20261013_contact_messages_production.sql
-- Production Contact Messages Schema & Upgrades
-- Run in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create or update the contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  inquiry_type TEXT DEFAULT 'career' NOT NULL CHECK (inquiry_type IN ('career', 'freelance', 'student', 'business', 'other')),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  email TEXT NOT NULL CHECK (char_length(email) >= 3 AND char_length(email) <= 254),
  organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 150),
  role TEXT CHECK (role IS NULL OR char_length(role) <= 100),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 3000),
  status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_hash TEXT,
  user_agent TEXT CHECK (user_agent IS NULL OR char_length(user_agent) <= 255),
  email_sent BOOLEAN DEFAULT false NOT NULL,
  webhook_sent BOOLEAN DEFAULT false NOT NULL,
  notification_status TEXT DEFAULT 'pending' NOT NULL CHECK (notification_status IN ('pending', 'sent', 'failed')),
  notification_error TEXT,
  notification_retries INT DEFAULT 0 NOT NULL,
  provider_message_id TEXT,
  notes TEXT,
  replied_at TIMESTAMPTZ
);

-- 2. Safe Alterations if table was previously created with the older schema
DO $$ 
BEGIN
  -- Add inquiry_type column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='inquiry_type') THEN
    ALTER TABLE public.contact_messages ADD COLUMN inquiry_type TEXT DEFAULT 'career' NOT NULL CHECK (inquiry_type IN ('career', 'freelance', 'student', 'business', 'other'));
  END IF;

  -- Add organization column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='organization') THEN
    ALTER TABLE public.contact_messages ADD COLUMN organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 150);
  END IF;

  -- Add role column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='role') THEN
    ALTER TABLE public.contact_messages ADD COLUMN role TEXT CHECK (role IS NULL OR char_length(role) <= 100);
  END IF;

  -- Add webhook_sent column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='webhook_sent') THEN
    ALTER TABLE public.contact_messages ADD COLUMN webhook_sent BOOLEAN DEFAULT false NOT NULL;
  END IF;

  -- Add notification_status column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='notification_status') THEN
    ALTER TABLE public.contact_messages ADD COLUMN notification_status TEXT DEFAULT 'pending' NOT NULL CHECK (notification_status IN ('pending', 'sent', 'failed'));
  END IF;

  -- Add notification_error column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='notification_error') THEN
    ALTER TABLE public.contact_messages ADD COLUMN notification_error TEXT;
  END IF;

  -- Add notification_retries column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='notification_retries') THEN
    ALTER TABLE public.contact_messages ADD COLUMN notification_retries INT DEFAULT 0 NOT NULL;
  END IF;

  -- Add provider_message_id column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='provider_message_id') THEN
    ALTER TABLE public.contact_messages ADD COLUMN provider_message_id TEXT;
  END IF;

  -- Add notes column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='notes') THEN
    ALTER TABLE public.contact_messages ADD COLUMN notes TEXT;
  END IF;

  -- Add replied_at column if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_messages' AND column_name='replied_at') THEN
    ALTER TABLE public.contact_messages ADD COLUMN replied_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Ensure Status Constraint allows ('new', 'read', 'replied', 'archived')
DO $$
BEGIN
  ALTER TABLE public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
  ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('new', 'read', 'replied', 'archived'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Create Performance & Rate Limiting Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON public.contact_messages (status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_inquiry_type
  ON public.contact_messages (inquiry_type);

CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_hash_created_at
  ON public.contact_messages (ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_notification_status
  ON public.contact_messages (notification_status);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Explicitly revoke all public anon permissions
-- We grant NO access to the public 'anon' role.
-- Only the server-side backend with SUPABASE_SERVICE_ROLE_KEY bypasses RLS.
REVOKE ALL ON public.contact_messages FROM anon;
REVOKE ALL ON public.contact_messages FROM authenticated;
