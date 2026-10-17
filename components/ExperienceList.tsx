'use client'

import { EXPERIENCE, SHOW_LEADERSHIP, LEADERSHIP_EXPERIENCE } from '@/lib/content'
import { MapPin, Calendar, Briefcase } from 'lucide-react'

export default function ExperienceList() {
  return (
    <section
      id="experience"
      className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-y border-border bg-surface/40 text-ink transition-colors duration-200 relative overflow-hidden"
    >
      {/* Corner Crop Marks for Print Proof Contrast */}
      <div className="absolute top-4 left-6 font-mono text-[10px] text-muted/50 select-none hidden sm:block">
        + RECORD_EXPERIENCE [SEC.03]
      </div>
      <div className="absolute top-4 right-6 font-mono text-[10px] text-muted/50 select-none hidden sm:block">
        + ARCHIVE_DOSSIER
      </div>

      <div className="container-editorial">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 font-mono text-xs text-accent font-semibold tracking-wider uppercase mb-2">
            <span>Section 03</span>
            <span>•</span>
            <span>Professional Background</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-3">
            Experience &amp; Journey
          </h2>
          <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            How I grew from frontend foundations to core engineering and production full-stack applications.
          </p>
        </div>

        {/* Experience Scannable Rows */}
        <div className="space-y-6 sm:space-y-8">
          {EXPERIENCE.map((exp, idx) => (
            <div
              key={exp.role + exp.company}
              className="p-6 sm:p-8 rounded-sm border border-border bg-paper hover:border-accent/40 transition-all duration-200 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-normal text-ink">
                    {exp.role}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-accent font-medium mt-0.5">
                    {exp.company}
                  </p>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{exp.period}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    <span>{exp.location}</span>
                  </span>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-2.5 mt-4 pt-4 border-t border-border">
                {exp.bullets.map((b, bi) => (
                  <li
                    key={bi}
                    className="text-sm text-ink/90 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="text-accent mt-1 text-xs flex-shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Optional Leadership Section */}
          {SHOW_LEADERSHIP && (
            <div className="pt-6 border-t border-border">
              <h3 className="font-display text-xl font-normal text-ink mb-4">
                Leadership Experience
              </h3>
              <div className="space-y-4">
                {LEADERSHIP_EXPERIENCE.map((exp) => (
                  <div
                    key={exp.role}
                    className="p-4 rounded-sm border border-border bg-paper/60"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                      <h4 className="font-display text-base font-semibold text-ink">
                        {exp.role} — <span className="text-accent">{exp.company}</span>
                      </h4>
                      <span className="font-mono text-xs text-muted">{exp.period}</span>
                    </div>
                    <ul className="space-y-1">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="text-xs text-muted flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
