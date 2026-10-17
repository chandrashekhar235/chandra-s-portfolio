import { NextResponse } from 'next/server'
import { contactSchema } from '@/lib/contact-schema'
import { checkRateLimit, hashIpAddress } from '@/lib/rate-limit'
import { saveMessage, updateMessage } from '@/lib/message-store'
import { dispatchNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function POST(request: Request) {
  try {
    // 1. Same-Origin & Host Verification
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const isDev = process.env.NODE_ENV !== 'production'

    if (origin) {
      try {
        const originUrl = new URL(origin)
        const originHost = originUrl.host
        const isSameHost = Boolean(host && originHost === host)
        const isLocalhost = isDev && (originHost.includes('localhost') || originHost.includes('127.0.0.1'))
        const isVercelDomain = originHost.endsWith('.vercel.app')
        const siteHost = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : ''
        const isAllowedCustom = Boolean(siteHost) && originHost === siteHost

        if (!isSameHost && !isLocalhost && !isVercelDomain && !isAllowedCustom) {
          return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin header' }, { status: 400 })
      }
    }

    // 2. Content-Type Check (JSON only)
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported Media Type. Expected application/json' },
        { status: 415 }
      )
    }

    // 3. Body Size Check (Max 15KB)
    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, 'utf8') > 15 * 1024) {
      return NextResponse.json(
        { error: 'Payload Too Large. Maximum message size is 15KB' },
        { status: 413 }
      )
    }

    // 4. Safe JSON Parsing
    let jsonBody: unknown
    try {
      jsonBody = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // 5. Honeypot check (hidden "website" field traps automated spam bots)
    if (
      typeof jsonBody === 'object' &&
      jsonBody !== null &&
      'website' in jsonBody &&
      Boolean((jsonBody as Record<string, unknown>).website)
    ) {
      // Return 200 silently so bots learn nothing
      return NextResponse.json({
        success: true,
        message: "Got it. I'll reply within a couple of days.",
      })
    }

    // 6. Zod Validation
    const validationResult = contactSchema.safeParse(jsonBody)
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message
        }
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: fieldErrors,
        },
        { status: 400 }
      )
    }

    const { inquiryType, name, email, organization, role, message } = validationResult.data

    // 7. Rate Limiting by Hashed IP (Max 5 submissions per hour)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || '127.0.0.1'

    const hashedIp = hashIpAddress(clientIp)
    const rateLimit = await checkRateLimit(hashedIp)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait before submitting again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset),
          },
        }
      )
    }

    // 8. Truncate User-Agent
    const rawUserAgent = request.headers.get('user-agent') || ''
    const userAgent = rawUserAgent.slice(0, 250)

    // 9. PERSISTENCE FIRST: Save to primary database store
    // NEVER claim success unless persistence actually succeeds!
    let savedMessage
    try {
      savedMessage = await saveMessage({
        inquiryType,
        name,
        email,
        organization: organization || undefined,
        role: role || undefined,
        message,
        ipHash: hashedIp,
        userAgent,
      })
    } catch (persistErr) {
      console.error('[ContactAPI] Persistence failure:', (persistErr as Error).message)
      return NextResponse.json(
        {
          error:
            'Unable to securely save your message. Please reach out directly at sahiljoshi399@gmail.com',
        },
        { status: 500 }
      )
    }

    // 10. NOTIFICATION SECOND: Dispatch Resend email and/or Webhooks
    try {
      const notificationResult = await dispatchNotifications({
        messageId: savedMessage.id,
        inquiryType,
        name,
        email,
        organization,
        role,
        message,
      })

      // Update message with notification delivery status & provider ID
      await updateMessage(savedMessage.id, {
        notificationStatus: notificationResult.status,
        emailSent: notificationResult.emailSent,
        webhookSent: notificationResult.webhookSent,
        providerMessageId: notificationResult.providerMessageId,
        notificationError: notificationResult.error,
      })
    } catch (notifyErr) {
      console.warn('[ContactAPI] Notification dispatch warning:', (notifyErr as Error).message)
      // Note: Message is safely saved! We update notification status as failed so admin can retry it.
      await updateMessage(savedMessage.id, {
        notificationStatus: 'failed',
        notificationError: (notifyErr as Error).message,
      })
    }

    // 11. Return Confirmed Success
    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      message: "Got it. I'll reply within a couple of days.",
    })
  } catch (err) {
    console.error('[ContactAPI] Unexpected error in POST handler:', (err as Error).name)
    return NextResponse.json(
      {
        error:
          'An unexpected error occurred. Please email directly at sahiljoshi399@gmail.com',
      },
      { status: 500 }
    )
  }
}
