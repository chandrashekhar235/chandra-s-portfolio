-- ==============================================================================
-- Canonical Supabase Schema for Contact Form Messages
-- Run in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

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

-- Performance & Rate Limiting Indexes
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Strict Access Control: No public access via anon key
REVOKE ALL ON public.contact_messages FROM anon;
REVOKE ALL ON public.contact_messages FROM authenticated;
