'use client'

import { PERSONAL_INFO, LAST_UPDATED } from '@/lib/content'
import { ArrowUp, Mail, Github, Linkedin, ArrowUpRight } from 'lucide-react'
import MagneticButton from './MagneticButton'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="py-16 sm:py-24 border-t border-border bg-surface/30 relative overflow-hidden">
      <div className="container-editorial">
        {/* Top Action Row: Magnetic Direct Contact & Social Links */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 pb-12 border-b border-border">
          <div>
            <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block mb-1">
              Next Steps
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-normal text-ink">
              Looking for a Full Stack Engineer?
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton>
              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="btn-editorial"
                data-cursor="Email"
              >
                <Mail size={15} />
                <span className="truncate max-w-[240px] sm:max-w-none">{PERSONAL_INFO.email}</span>
              </a>
            </MagneticButton>

            <MagneticButton>
              <button
                onClick={scrollToTop}
                className="btn-secondary"
                data-cursor="Top"
                aria-label="Back to top of page"
              >
                <span>Back to top</span>
                <ArrowUp size={14} />
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* Large Full-Width Wordmark */}

        <div className="mb-10 overflow-hidden py-3 select-none">
          <div
            className="flex w-max animate-marquee motion-reduce:animate-none"
            aria-label="Building intelligent systems"
          >
            {[0, 1].map((item) => (
              <div
                key={item}
                className="flex shrink-0 items-center"
                aria-hidden={item === 1}
              >
                <span className="font-display text-[clamp(1.5rem,4vw,4rem)] font-bold tracking-[-0.04em] text-ink/70 leading-none whitespace-nowrap pr-6">
                  BUILDING INTELLIGENT SYSTEMS.
                </span>
                <span className="text-ink/40 text-2xl pr-6">
                  ✳
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* Colophon & Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border font-mono text-xs text-muted">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-ink font-medium">{PERSONAL_INFO.name}</span>
            <span>•</span>
            <span className="text-muted">Last updated: {LAST_UPDATED}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink transition-colors flex items-center gap-1 link-draw"
              data-cursor="GitHub"
            >
              <span>GitHub</span>
              <ArrowUpRight size={12} />
            </a>
            <span>•</span>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink transition-colors flex items-center gap-1 link-draw"
              data-cursor="LinkedIn"
            >
              <span>LinkedIn</span>
              <ArrowUpRight size={12} />
            </a>
            <span>•</span>
            <a
              href={PERSONAL_INFO.resumePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-semibold"
              data-cursor="Resume"
            >
              Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
