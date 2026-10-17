'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PERSONAL_INFO } from '@/lib/content'
import { contactSchema, INQUIRY_TYPES, InquiryType } from '@/lib/contact-schema'
import {
  Mail,
  FileDown,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Briefcase,
  Code2,
  GraduationCap,
  Building2,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react'

interface InquiryOption {
  type: InquiryType
  label: string
  shortLabel: string
  icon: typeof Briefcase
  orgLabel: string
  orgPlaceholder: string
  showRole: boolean
  messagePlaceholder: string
}

const INQUIRY_CONFIG: Record<InquiryType, InquiryOption> = {
  career: {
    type: 'career',
    label: 'Career opportunity / Recruitment',
    shortLabel: 'Career / Hiring',
    icon: Briefcase,
    orgLabel: 'Company / Organization',
    orgPlaceholder: 'e.g. DeepMind, Microsoft, Startup',
    showRole: true,
    messagePlaceholder:
      'Tell me about the role, team focus, tech stack, and timeline for hiring...',
  },
  freelance: {
    type: 'freelance',
    label: 'Freelance project / Collaboration',
    shortLabel: 'Freelance / Collab',
    icon: Code2,
    orgLabel: 'Company, Startup, or Brand',
    orgPlaceholder: 'e.g. Studio, Startup, Project Name',
    showRole: false,
    messagePlaceholder:
      'Describe the project scope, technical requirements, deliverables, and estimated timeline...',
  },
  student: {
    type: 'student',
    label: 'Student / Learning / Networking',
    shortLabel: 'Student / Network',
    icon: GraduationCap,
    orgLabel: 'College / University / Community',
    orgPlaceholder: 'e.g. University, Tech Club, Research Group',
    showRole: false,
    messagePlaceholder:
      'What topic would you like to discuss, explore, or build together?...',
  },
  business: {
    type: 'business',
    label: 'Business inquiry / Partnership',
    shortLabel: 'Business / Partner',
    icon: Building2,
    orgLabel: 'Company or Entity Name',
    orgPlaceholder: 'e.g. Organization, Product, Enterprise',
    showRole: true,
    messagePlaceholder:
      'Share details regarding your partnership proposal, API integration, or business inquiry...',
  },
  other: {
    type: 'other',
    label: 'Other inquiry',
    shortLabel: 'General Note',
    icon: HelpCircle,
    orgLabel: 'Organization (Optional)',
    orgPlaceholder: 'e.g. Organization or Affiliation',
    showRole: false,
    messagePlaceholder: 'How can I assist or collaborate with you?...',
  },
}

const CAREER_ROLE_OPTIONS = [
  'Recruiter / Talent Partner',
  'Hiring Manager',
  'Founder / CEO',
  'Engineering Lead',
  'Other',
]

export default function ContactForm() {
  const [inquiryType, setInquiryType] = useState<InquiryType>('career')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: '',
    website: '', // Honeypot field for spam prevention
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const [submittedMessageId, setSubmittedMessageId] = useState<string | null>(null)

  const activeConfig = INQUIRY_CONFIG[inquiryType]

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PERSONAL_INFO.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const handleInquiryChange = (type: InquiryType) => {
    setInquiryType(type)
    // Clear inquiry-specific errors when user changes category
    if (fieldErrors.inquiryType) {
      setFieldErrors((prev) => ({ ...prev, inquiryType: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setServerError(null)

    const payload = {
      ...formData,
      inquiryType,
    }

    // 1. Client-side Zod validation
    const clientValidation = contactSchema.safeParse(payload)
    if (!clientValidation.success) {
      const errors: Record<string, string> = {}
      clientValidation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[String(issue.path[0])] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && data.errors) {
          setFieldErrors(data.errors)
          setStatus('idle')
          return
        }
        if (res.status === 429) {
          throw new Error(data.error || 'Too many submissions. Please wait before submitting again.')
        }
        throw new Error(data.error || 'Unable to deliver message right now.')
      }

      setSubmittedMessageId(data.messageId || null)
      setStatus('success')
      // Reset form fields on successful persistence only
      setFormData({
        name: '',
        email: '',
        organization: '',
        role: '',
        message: '',
        website: '',
      })
    } catch (err: any) {
      setStatus('error')
      setServerError(
        err.message ||
          'Unable to deliver message. Please reach out directly at sahiljoshi399@gmail.com'
      )
      // Entered text is intentionally preserved on failure so user does not lose their message!
    }
  }

  return (
    <section
      id="contact"
      className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-t border-border bg-paper relative overflow-hidden"
    >
      <div className="container-editorial">
        <div className="grid lg:grid-cols-[0.88fr_1.12fr] gap-10 sm:gap-14 items-start">
          {/* Left Column: Direct Communication Channels & Status */}
          <div>
            <div className="font-mono text-xs text-accent font-semibold tracking-wider uppercase mb-2">
              Communication // Channel 01
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-4">
              Get in Touch
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed mb-8">
              I am open to full-time software engineering roles and high-impact freelance projects. If you have something to build, or just want to say hello, send me a message.
            </p>

            <div className="space-y-4">
              {/* Primary Email Card with Quick Copy */}
              <div className="p-4 sm:p-5 rounded-sm border border-border bg-surface flex items-center justify-between gap-3 shadow-xs">
                <div className="overflow-hidden min-w-0">
                  <span className="font-mono text-[11px] text-muted uppercase tracking-wider block mb-1">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${PERSONAL_INFO.email}`}
                    className="font-mono text-sm sm:text-base text-ink font-semibold hover:text-accent transition-colors flex items-center gap-1.5 link-draw truncate"
                    data-cursor="Email"
                  >
                    <Mail size={16} className="text-accent flex-shrink-0" />
                    <span className="truncate">{PERSONAL_INFO.email}</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 rounded border border-border bg-paper text-muted hover:text-ink hover:bg-surface text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0"
                  data-cursor="Copy"
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check size={13} />
                      <span>Copied!</span>
                    </span>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Master Resume PDF Download Card */}
              <div className="p-4 sm:p-5 rounded-sm border border-border bg-surface shadow-xs">
                <span className="font-mono text-[11px] text-muted uppercase tracking-wider block mb-1">
                  Verified Dossier
                </span>
                <a
                  href={PERSONAL_INFO.resumePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm sm:text-base text-ink font-semibold hover:text-accent transition-colors flex items-center gap-1.5 link-draw"
                  data-cursor="Resume"
                >
                  <FileDown size={16} className="text-accent flex-shrink-0" />
                  <span>Download Master Resume (PDF)</span>
                </a>
              </div>

              {/* Profiles Row */}
              <div className="p-4 sm:p-5 rounded-sm border border-border bg-surface shadow-xs">
                <span className="font-mono text-[11px] text-muted uppercase tracking-wider block mb-1">
                  Profiles &amp; Code
                </span>
                <div className="flex items-center gap-4 mt-1 font-mono text-sm">
                  <a
                    href={PERSONAL_INFO.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-accent transition-colors flex items-center gap-1 link-draw"
                    data-cursor="GitHub"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight size={13} />
                  </a>
                  <span className="text-border">•</span>
                  <a
                    href={PERSONAL_INFO.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-accent transition-colors flex items-center gap-1 link-draw"
                    data-cursor="LinkedIn"
                  >
                    <span>LinkedIn</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Recruiter & Client Contact Form */}
          <div className="p-5 sm:p-8 rounded-sm border border-border bg-surface shadow-xs relative">
            <div className="mb-6">
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-ink mb-1">
                Send a Direct Inquiry
              </h3>
              <p className="font-mono text-xs text-muted">
                Persisted securely to database &amp; delivered to Chandra&apos;s primary inbox.
              </p>
            </div>

            {/* Success State */}
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
                aria-live="polite"
                className="p-8 sm:p-10 rounded-sm border border-accent/40 bg-accent-subtle/40 text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-paper border border-accent/40 flex items-center justify-center text-accent mb-3 shadow-xs">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-display font-semibold text-xl text-ink mb-2">
                  Inquiry Received &amp; Logged
                </h4>
                <p className="text-xs sm:text-sm font-sans text-ink/90 max-w-md leading-relaxed mb-2">
                  Thank you for reaching out. Your message has been safely persisted and delivered to
                  Chandra. I typically reply within 24–48 hours.
                </p>
                {submittedMessageId && (
                  <p className="font-mono text-[11px] text-muted mb-6">
                    Reference ID: <code className="bg-paper px-1.5 py-0.5 rounded border border-border">{submittedMessageId}</code>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Send another note
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Honeypot field (hidden from humans, traps automated bot submissions) */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {/* 1. Inquiry Type Selector Tabs */}
                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
                    Inquiry Type <span className="text-accent">*</span>
                  </label>
                  <div
                    role="radiogroup"
                    aria-label="Inquiry Type"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                  >
                    {INQUIRY_TYPES.map((type) => {
                      const cfg = INQUIRY_CONFIG[type]
                      const Icon = cfg.icon
                      const isSelected = inquiryType === type

                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleInquiryChange(type)}
                          className={`p-2.5 rounded text-left transition-all border flex items-center gap-2 ${
                            isSelected
                              ? 'bg-paper text-ink border-accent shadow-xs'
                              : 'bg-paper/50 text-muted hover:text-ink hover:bg-paper border-border'
                          }`}
                        >
                          <Icon size={14} className={isSelected ? 'text-accent' : 'text-muted'} />
                          <span className="font-mono text-xs font-medium truncate">
                            {cfg.shortLabel}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5"
                    >
                      Full Name <span className="text-accent">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' })
                      }}
                      placeholder="e.g. Maya Chen"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-sm border bg-paper text-base sm:text-sm text-ink placeholder:text-muted/60 focus:border-accent transition-colors ${
                        fieldErrors.name ? 'border-red-500/70' : 'border-border'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" role="alert" className="mt-1 font-mono text-[11px] text-red-600 dark:text-red-400">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5"
                    >
                      Email Address <span className="text-accent">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                      }}
                      placeholder="maya@company.com"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-sm border bg-paper text-base sm:text-sm text-ink placeholder:text-muted/60 focus:border-accent transition-colors ${
                        fieldErrors.email ? 'border-red-500/70' : 'border-border'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" role="alert" className="mt-1 font-mono text-[11px] text-red-600 dark:text-red-400">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Dynamic Organization Field (Conditional Label based on Inquiry Type) */}
                {inquiryType !== 'other' && (
                  <div>
                    <label
                      htmlFor="contact-org"
                      className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5"
                    >
                      {activeConfig.orgLabel} <span className="text-muted/60 text-[10px] lowercase">(optional)</span>
                    </label>
                    <input
                      id="contact-org"
                      type="text"
                      autoComplete="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={activeConfig.orgPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-paper text-base sm:text-sm text-ink placeholder:text-muted/60 focus:border-accent transition-colors"
                    />
                  </div>
                )}

                {/* 4. Professional Role Field (Shown for Career & Business inquiries) */}
                {activeConfig.showRole && (
                  <div>
                    <label
                      htmlFor="contact-role"
                      className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5"
                    >
                      Your Role / Title <span className="text-muted/60 text-[10px] lowercase">(optional)</span>
                    </label>
                    {inquiryType === 'career' ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {CAREER_ROLE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFormData({ ...formData, role: opt })}
                              className={`font-mono text-[11px] px-2.5 py-1 rounded-sm border transition-colors ${
                                formData.role === opt
                                  ? 'bg-paper text-ink border-accent'
                                  : 'bg-paper/40 text-muted hover:text-ink border-border'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <input
                          id="contact-role"
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="Or type custom role title (e.g. Lead ML Engineer)..."
                          className="w-full px-3 py-2 rounded-sm border border-border bg-paper text-xs text-ink placeholder:text-muted/60 focus:border-accent transition-colors"
                        />
                      </div>
                    ) : (
                      <input
                        id="contact-role"
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. VP of Product, Strategic Partner..."
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-paper text-base sm:text-sm text-ink placeholder:text-muted/60 focus:border-accent transition-colors"
                      />
                    )}
                  </div>
                )}

                {/* 5. Message Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="contact-message"
                      className="block font-mono text-xs text-muted uppercase tracking-wider"
                    >
                      Message <span className="text-accent">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-muted">
                      {formData.message.length} / 3000 chars
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value })
                      if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: '' })
                    }}
                    placeholder={activeConfig.messagePlaceholder}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-sm border bg-paper text-base sm:text-sm text-ink placeholder:text-muted/60 focus:border-accent transition-colors resize-y min-h-[110px] ${
                      fieldErrors.message ? 'border-red-500/70' : 'border-border'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p id="message-error" role="alert" className="mt-1 font-mono text-[11px] text-red-600 dark:text-red-400">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Server Error Alert */}
                {serverError && (
                  <div
                    role="alert"
                    className="p-3 rounded-sm border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 font-mono text-xs flex items-start gap-2"
                  >
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Submit Action & Privacy Note */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="font-mono text-[10px] text-muted/70 order-2 sm:order-1 max-w-xs leading-relaxed">
                    Direct communication guarantee: your note is sent privately and is never shared.
                  </p>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-editorial justify-center py-2.5 px-6 min-h-[44px] text-sm order-1 sm:order-2 disabled:opacity-60 cursor-pointer"
                    data-cursor="Send"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Delivering...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>
                          {inquiryType === 'career' ? 'Send Career Inquiry' : "Let's Connect"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
