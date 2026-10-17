'use client'

import { SKILL_CATEGORIES, CERTIFICATIONS } from '@/lib/content'
import { Award, CheckCircle } from 'lucide-react'

export default function SkillsCerts() {
  return (
    <section id="skills" className="scroll-mt-20 sm:scroll-mt-24 py-12 sm:py-16 border-t border-border">
      <div className="container-editorial">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 sm:gap-14">
          {/* Left Column: Core Technical Skills (Grouped Lists, No Bars) */}
          <div>
            <div className="font-mono text-xs text-accent font-semibold tracking-wider uppercase mb-2">
              Proficiencies
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-ink tracking-tight mb-6">
              Technical Stack
            </h2>

            <div className="space-y-6">
              {SKILL_CATEGORIES.map((group) => (
                <div key={group.category} className="pb-4 border-b border-border/70 last:border-0">
                  <h3 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider mb-2.5">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="font-mono text-xs px-2.5 py-1 rounded-sm border border-border bg-surface text-ink/90"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {CERTIFICATIONS.length > 0 && (
          <div>
            <div className="font-mono text-xs text-accent font-semibold tracking-wider uppercase mb-2">
              Credentials
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-ink tracking-tight mb-6">
              Certifications
            </h2>

            <div className="space-y-3.5">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.title}
                  className="p-4 rounded-sm border border-border bg-surface flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded bg-paper border border-border flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                    <Award size={16} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-display font-semibold text-sm sm:text-base text-ink leading-snug">
                      {cert.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 font-mono text-xs text-muted">
                      <span>{cert.issuer}</span>
                      <span>•</span>
                      <span className="text-accent">{cert.platform}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Note */}
            <div className="mt-6 p-4 rounded-sm border border-dashed border-border bg-surface/40 text-xs font-mono text-muted leading-relaxed">
              <p>
                All certificates verified via Coursera Online. Official credential links can be verified on LinkedIn or supplied upon interview request.
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  )
}
