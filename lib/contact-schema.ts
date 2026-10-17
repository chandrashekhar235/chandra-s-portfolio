import { z } from 'zod'

export const INQUIRY_TYPES = [
  'career',
  'freelance',
  'student',
  'business',
  'other',
] as const

export type InquiryType = (typeof INQUIRY_TYPES)[number]

export const INQUIRY_LABELS: Record<InquiryType, string> = {
  career: 'Career opportunity / Recruitment',
  freelance: 'Freelance project / Collaboration',
  student: 'Student / Learning / Networking',
  business: 'Business inquiry / Partnership',
  other: 'Other inquiry',
}

export const contactSchema = z.object({
  inquiryType: z.enum(INQUIRY_TYPES).default('career'),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Full name is required' })
    .max(100, { message: 'Name must be 100 characters or less' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address (e.g. name@domain.com)' })
    .max(254, { message: 'Email address must be 254 characters or less' }),
  organization: z
    .string()
    .trim()
    .max(150, { message: 'Organization must be 150 characters or less' })
    .optional()
    .default(''),
  role: z
    .string()
    .trim()
    .max(100, { message: 'Role must be 100 characters or less' })
    .optional()
    .default(''),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters long' })
    .max(3000, { message: 'Message must not exceed 3,000 characters' }),
  // Honeypot field for spam bots (must remain empty)
  website: z.string().optional().default(''),
  // Optional Cloudflare Turnstile token for serverless bot defense
  cfTurnstileToken: z.string().optional().default(''),
})

export type ContactFormData = z.infer<typeof contactSchema>
