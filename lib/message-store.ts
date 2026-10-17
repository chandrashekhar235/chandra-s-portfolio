import 'server-only'
import crypto from 'crypto'
import { getSupabaseServerClient } from './supabase'
import { InquiryType } from './contact-schema'

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface ContactMessage {
  id: string
  createdAt: string
  inquiryType: InquiryType
  name: string
  email: string
  organization?: string
  role?: string
  message: string
  status: MessageStatus
  ipHash: string
  userAgent: string
  emailSent: boolean
  webhookSent: boolean
  notificationStatus: NotificationStatus
  notificationError?: string
  notificationRetries: number
  providerMessageId?: string
  notes?: string
  repliedAt?: string
}

export interface SaveMessageParams {
  inquiryType: InquiryType
  name: string
  email: string
  organization?: string
  role?: string
  message: string
  ipHash: string
  userAgent: string
}

export interface UpdateMessageParams {
  status?: MessageStatus
  notes?: string
  notificationStatus?: NotificationStatus
  notificationError?: string
  notificationRetries?: number
  providerMessageId?: string
  emailSent?: boolean
  webhookSent?: boolean
  repliedAt?: string
}

/**
 * Check if Supabase connection is active and configured
 */
export function isSupabaseActive(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
}

/**
 * Save a new incoming contact message directly to Supabase PostgreSQL.
 * Strict serverless persistence: Supabase is the sole persistence store.
 * Throws an error if Supabase credentials are missing or if the insert fails,
 * ensuring the contact API NEVER falsely claims delivery or success.
 */
export async function saveMessage(params: SaveMessageParams): Promise<ContactMessage> {
  const supabase = getSupabaseServerClient()

  if (!supabase) {
    throw new Error(
      'Database connection unavailable: SUPABASE_URL and SUPABASE_SECRET_KEY must be configured on the server.'
    )
  }

  const id = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  const now = new Date().toISOString()

  const newMessage: ContactMessage = {
    id,
    createdAt: now,
    inquiryType: params.inquiryType,
    name: params.name.trim(),
    email: params.email.trim(),
    organization: params.organization?.trim() || undefined,
    role: params.role?.trim() || undefined,
    message: params.message.trim(),
    status: 'new',
    ipHash: params.ipHash,
    userAgent: params.userAgent,
    emailSent: false,
    webhookSent: false,
    notificationStatus: 'pending',
    notificationRetries: 0,
  }

  const { error } = await supabase.from('contact_messages').insert({
    id: newMessage.id,
    created_at: newMessage.createdAt,
    inquiry_type: newMessage.inquiryType,
    name: newMessage.name,
    email: newMessage.email,
    organization: newMessage.organization || null,
    role: newMessage.role || null,
    message: newMessage.message,
    status: newMessage.status,
    ip_hash: newMessage.ipHash,
    user_agent: newMessage.userAgent,
    email_sent: false,
    webhook_sent: false,
    notification_status: 'pending',
    notification_retries: 0,
  })

  if (error) {
    console.error('[MessageStore] Supabase insert failed:', error.message)
    throw new Error(`Failed to persist inquiry to Supabase database: ${error.message}`)
  }

  return newMessage
}

/**
 * Update message notification delivery status and metadata in Supabase PostgreSQL
 */
export async function updateMessage(id: string, updates: UpdateMessageParams): Promise<void> {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    console.error('[MessageStore] Cannot update message status: Supabase client is null')
    return
  }

  const dbUpdates: Record<string, unknown> = {}
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes
  if (updates.notificationStatus !== undefined) dbUpdates.notification_status = updates.notificationStatus
  if (updates.notificationError !== undefined) dbUpdates.notification_error = updates.notificationError
  if (updates.notificationRetries !== undefined) dbUpdates.notification_retries = updates.notificationRetries
  if (updates.providerMessageId !== undefined) dbUpdates.provider_message_id = updates.providerMessageId
  if (updates.emailSent !== undefined) dbUpdates.email_sent = updates.emailSent
  if (updates.webhookSent !== undefined) dbUpdates.webhook_sent = updates.webhookSent
  if (updates.repliedAt !== undefined) dbUpdates.replied_at = updates.repliedAt

  const { error } = await supabase.from('contact_messages').update(dbUpdates).eq('id', id)
  if (error) {
    console.error(`[MessageStore] Failed to update message metadata in Supabase for ${id}:`, error.message)
  }
}
