import 'server-only'
import { Resend } from 'resend'
import { INQUIRY_LABELS, InquiryType } from './contact-schema'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export interface SendNotificationParams {
  messageId: string
  inquiryType: string
  name: string
  email: string
  organization?: string
  role?: string
  message: string
}

export interface NotificationResult {
  status: 'sent' | 'failed'
  emailSent: boolean
  webhookSent: boolean
  providerMessageId?: string
  error?: string
}

/**
 * Execute a function with bounded retries and backoff for transient failures
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 600
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }
  throw lastError
}

/**
 * Dispatch contact notifications across all configured channels
 * (Resend email, Discord/Slack/Telegram webhook).
 * State is tracked independently and safe error details are captured.
 */
export async function dispatchNotifications(
  params: SendNotificationParams
): Promise<NotificationResult> {
  const result: NotificationResult = {
    status: 'failed',
    emailSent: false,
    webhookSent: false,
  }

  const { messageId, inquiryType, name, email, organization, role, message } = params
  const inquiryLabel = INQUIRY_LABELS[inquiryType as InquiryType] || inquiryType
  const errors: string[] = []

  // 1. Resend Email Dispatch
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey)
      const toEmail = process.env.CONTACT_TO_EMAIL || 'sahiljoshi399@gmail.com'
      const fromEmail =
        process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>'

      const escapedName = escapeHtml(name)
      const escapedEmail = escapeHtml(email)
      const escapedOrg = organization ? escapeHtml(organization) : null
      const escapedRole = role ? escapeHtml(role) : null
      const escapedMessage = escapeHtml(message).replace(/\n/g, '<br/>')

      const res = await withRetry(async () => {
        return await resend.emails.send({
          from: fromEmail,
          to: [toEmail],
          replyTo: email,
          subject: `[Portfolio - ${inquiryLabel}] Message from ${name}`,
          headers: {
            'X-Entity-Ref-ID': messageId,
          },
          text: `New Portfolio Message Received\n\nInquiry Type: ${inquiryLabel}\nFrom: ${name} <${email}>\n${
            organization ? `Organization: ${organization}\n` : ''
          }${role ? `Role: ${role}\n` : ''}\nMessage:\n${message}\n\nReference ID: ${messageId}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; padding: 24px; border: 1px solid #E5E0D8; border-radius: 6px; background: #FBF9F5; color: #181716;">
              <div style="border-bottom: 2px solid #C04A26; padding-bottom: 12px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #C04A26; font-weight: bold;">
                  Portfolio Contact Alert
                </span>
                <h2 style="margin: 6px 0 0 0; color: #181716; font-size: 20px; font-weight: 600;">
                  New ${escapeHtml(inquiryLabel)}
                </h2>
              </div>
              
              <div style="background: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 4px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>From:</strong> ${escapedName}</p>
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${escapedEmail}" style="color: #C04A26; text-decoration: underline;">${escapedEmail}</a></p>
                ${escapedOrg ? `<p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Organization:</strong> ${escapedOrg}</p>` : ''}
                ${escapedRole ? `<p style="margin: 0; font-size: 14px;"><strong>Role:</strong> ${escapedRole}</p>` : ''}
              </div>

              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; color: #6B6760;">Message Body:</p>
                <div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px; background: #FFFFFF; padding: 16px; border-radius: 4px; border: 1px solid #E5E0D8;">
                  ${escapedMessage}
                </div>
              </div>

              <div style="padding-top: 14px; border-top: 1px solid #E5E0D8; font-size: 11px; color: #6B6760; display: flex; justify-content: space-between;">
                <span>Reference: <code>${messageId}</code></span>
                <a href="mailto:${escapedEmail}?subject=Re: Portfolio Inquiry" style="color: #C04A26; text-decoration: underline; font-weight: 600;">Reply via Email &rarr;</a>
              </div>
            </div>
          `,
        })
      })

      if (!res.error && res.data?.id) {
        result.emailSent = true
        result.providerMessageId = res.data.id
      } else {
        const errorMsg = res.error?.message || 'Unknown Resend API error'
        errors.push(`Resend: ${errorMsg}`)
      }
    } catch (err) {
      errors.push(`Resend exception: ${(err as Error).message || 'Connection failure'}`)
    }
  }

  // 2. Webhook Dispatch (Discord / Slack / Generic Webhook)
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const isDiscord = webhookUrl.includes('discord.com/api/webhooks')
      const payload = isDiscord
        ? {
            username: 'Portfolio Contact Bot',
            embeds: [
              {
                title: `[${inquiryLabel}] New Message from ${name}`,
                color: 0xc04a26, // Warm terracotta accent
                fields: [
                  { name: 'Sender', value: name, inline: true },
                  { name: 'Email', value: email, inline: true },
                  ...(organization ? [{ name: 'Organization', value: organization, inline: true }] : []),
                  ...(role ? [{ name: 'Role', value: role, inline: true }] : []),
                  {
                    name: 'Message',
                    value: message.length > 1000 ? message.slice(0, 997) + '...' : message,
                  },
                ],
                footer: { text: `Ref: ${messageId}` },
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : {
            event: 'contact_form_submitted',
            messageId,
            inquiryType,
            sender: name,
            email,
            organization,
            role,
            message,
            timestamp: new Date().toISOString(),
          }

      const res = await withRetry(async () => {
        return await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      })

      if (res.ok) {
        result.webhookSent = true
      } else {
        errors.push(`Webhook responded with HTTP ${res.status}`)
      }
    } catch (err) {
      errors.push(`Webhook exception: ${(err as Error).message || 'Request failure'}`)
    }
  }

  // Determine aggregate notification status
  // If either email was sent or webhook was sent, status is 'sent'
  // If neither service is configured, status is 'sent' (local mode) or 'pending'
  const isAnyConfigured = Boolean(resendApiKey || webhookUrl)
  if (!isAnyConfigured) {
    result.status = 'sent' // In zero-config local mode, no notifications are configured
  } else if (result.emailSent || result.webhookSent) {
    result.status = 'sent'
  } else {
    result.status = 'failed'
    result.error = errors.join('; ')
  }

  return result
}
