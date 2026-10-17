'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Project, SHOW_PLACEHOLDERS } from '@/lib/content'
import { Github, ExternalLink, Video, HelpCircle } from 'lucide-react'
import TextScramble from './TextScramble'

interface ProjectEntryProps {
  project: Project
  index: number
  totalProjects: number
}

export default function ProjectEntry({ project, index, totalProjects }: ProjectEntryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const indexStr = String(index + 1).padStart(2, '0')
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (hover: hover)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Parallax on the oversized numeral
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const numeralY = useTransform(scrollYProgress, [0, 1], ['-15%', '25%'])

  // Check valid URLs
  const hasLiveUrl = !!(project.links.live && !project.links.live.isTodo && project.links.live.url)
  const hasGithubUrl = !!(project.links.github && !project.links.github.isTodo && project.links.github.url)
  const hasAnyLinkToRender =
    hasLiveUrl ||
    hasGithubUrl ||
    project.inDevelopment ||
    (SHOW_PLACEHOLDERS && (project.links.github?.isTodo || project.links.live?.isTodo))

  return (
    <article
      ref={containerRef}
      id={project.id}
      className={`scroll-mt-20 sm:scroll-mt-24 relative py-12 sm:py-20 ${
        index > 0 ? 'border-t border-border' : ''
      } transition-colors duration-200`}
      data-cursor="Inspect"
    >
      {/* Margin Note / Print Proof Annotation */}
      <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-6 pb-2 border-b border-border/50">
        <span className="flex items-center gap-2">
          <span className="text-accent font-semibold">Plate {indexStr}</span>
          <span>•</span>
          <span className="uppercase">{project.role}</span>
        </span>
        <span className="text-muted/70 hidden sm:inline">
          [SEC. PROJECTS // {indexStr} OF {String(totalProjects).padStart(2, '0')}]
        </span>
      </div>

      <div className="grid lg:grid-cols-[0.28fr_0.72fr] gap-8 sm:gap-12 relative">
        {/* Left Column: Oversized Parallax Numeral & Dates */}
        <div className="relative flex flex-col justify-between">
          <div className="sticky top-24">
            {/* Oversized Parallax Numeral (Decorative Vector Art) */}
            <motion.div
              style={{ y: isDesktop ? numeralY : 0 }}
              className="select-none pointer-events-none -mb-4 sm:-mb-6 overflow-visible"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 180 110"
                className="w-28 sm:w-36 lg:w-44 h-auto text-border overflow-visible"
                aria-hidden="true"
                role="presentation"
              >
                <text
                  x="0"
                  y="92"
                  fill="currentColor"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 700, fontSize: '100px', letterSpacing: '-0.06em' }}
                >
                  {indexStr}
                </text>
              </svg>
            </motion.div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase">
                {project.timeline}
              </span>
              <span className="font-mono text-xs text-muted">
                Role: {project.role}
              </span>
              {project.inDevelopment && (
                <span className="inline-flex items-center gap-1.5 mt-2.5 px-2 py-0.5 text-[11px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-sm w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  IN DEVELOPMENT
                </span>
              )}
              {project.featured && (
                <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-mono font-semibold bg-accent-subtle text-accent border border-accent-border rounded-sm w-max">
                  FEATURED PLATFORM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Project Details */}
        <div className="flex flex-col">
          {/* Header: Title and Subtitle */}
          <div className="mb-6">
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-ink tracking-tight mb-2">
              {project.title}
            </h3>
            <p className="font-mono text-sm sm:text-base text-muted">
              {project.subtitle}
            </p>
          </div>

          {/* Description of What Was Built (Strictly Resume Wording) */}
          <div className="mb-8 p-5 rounded-sm border border-border bg-surface/50">
            <p className="text-sm sm:text-base text-ink/90 leading-relaxed font-sans">
              {project.whatIBuilt.join(' ')}
            </p>
          </div>

          {/* How It Works: System Architecture (Labeled as simplified overview with self-drawing SVG flow) */}
          {project.architectureOverview && (
            <div className="mb-8 p-5 sm:p-6 rounded-sm border border-border bg-surface overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink font-semibold uppercase tracking-wider">
                    How it works // {project.architectureOverview.label}
                  </span>
                  <span className="font-mono text-[10px] text-ink font-medium bg-accent-subtle px-1.5 py-0.5 rounded border border-accent-border">
                    Simplified Overview
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
                  {project.inDevelopment ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>In Development</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Production Architecture</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile swipe hint */}
              <div className="sm:hidden font-mono text-[10px] text-muted/70 mb-2 flex items-center justify-end gap-1">
                <span>&larr; Swipe to view full flow &rarr;</span>
              </div>

              {/* Animated Node Flow */}
              <div className="overflow-x-auto py-2 no-scrollbar">
                <div className="flex items-center gap-2 sm:gap-3 min-w-[560px] justify-between">
                  {project.architectureOverview.nodes.map((node, ni, arr) => (
                    <div key={node.id} className="flex items-center gap-2 sm:gap-3 flex-1">
                      {/* Node Box with entrance spring */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: ni * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 p-3 rounded border border-border bg-paper text-center shadow-xs"
                      >
                        <div className="font-mono text-xs font-semibold text-ink">
                          {node.label}
                        </div>
                        <div className="font-mono text-[11px] text-muted mt-0.5">
                          {node.sub}
                        </div>
                      </motion.div>

                      {/* Connecting Line with SVG Dash Draw Animation */}
                      {ni < arr.length - 1 && (
                        <div className="flex flex-col items-center flex-shrink-0 px-1">
                          <svg width="28" height="14" viewBox="0 0 28 14" className="text-accent overflow-visible">
                            <motion.line
                              x1="0"
                              y1="7"
                              x2="24"
                              y2="7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeDasharray="24"
                              initial={{ strokeDashoffset: 24 }}
                              whileInView={{ strokeDashoffset: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, delay: ni * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            />
                            <polygon points="23,3 28,7 23,11" fill="currentColor" />
                          </svg>
                          <span className="font-mono text-[9px] text-muted text-center max-w-[70px] mt-0.5 leading-tight">
                            {project.architectureOverview?.connections[ni]?.label || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Checklist Note */}
              <div className="mt-4 pt-3 border-t border-border/60 text-xs font-mono text-muted flex items-start gap-2">
                <span className="text-accent font-semibold flex-shrink-0">To confirm:</span>
                <span>{project.architectureOverview.confirmationNote}</span>
              </div>
            </div>
          )}

          {/* Benchmark / Metric Placeholder (Only rendered if SHOW_PLACEHOLDERS is true) */}
          {SHOW_PLACEHOLDERS && project.metricTodo && (
            <div className="mb-6 p-3.5 rounded-sm border border-dashed border-accent/40 bg-accent-subtle/30 flex items-start gap-2.5 text-xs font-mono text-muted">
              <span className="text-accent font-semibold flex-shrink-0">[Metric Needed]:</span>
              <span>{project.metricTodo}</span>
            </div>
          )}

          {/* Designed Editorial Plate Placeholder Media Frame */}
          {SHOW_PLACEHOLDERS && project.links.demoMedia?.isTodo && (
            <div className="mb-8 rounded-sm border border-border editorial-plate editorial-shimmer p-8 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-paper border border-border flex items-center justify-center text-muted mb-3 shadow-xs">
                <Video size={18} />
              </div>
              <span className="font-mono text-[10px] text-accent bg-accent-subtle border border-accent/30 px-2 py-0.5 rounded uppercase tracking-widest font-semibold mb-2">
                Editorial Plate // Demo Recording
              </span>
              <p className="font-display text-lg text-ink font-normal mb-1">
                Demo Recording Coming Soon
              </p>
              <p className="font-mono text-xs text-muted max-w-md leading-relaxed">
                {project.links.demoMedia.todoNote}
              </p>
            </div>
          )}

          {/* Tech Stack Chips & Action Links */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Stack Tags with TextScramble effect on hover */}
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs px-2.5 py-1 rounded-sm border border-border bg-surface text-ink hover:border-accent/50 transition-colors"
                >
                  <TextScramble text={t} />
                </span>
              ))}
            </div>

            {/* Links / Placeholders */}
            {hasAnyLinkToRender && (
              <div className="flex flex-wrap items-center gap-3">
                {/* In Development Badge */}
                {project.inDevelopment && !project.links.github?.url && !project.links.live?.url && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-sm border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    In Development
                  </span>
                )}

                {/* GitHub Source Link */}
                {project.links.github && (
                  project.links.github.url ? (
                    <a
                      href={project.links.github.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1 px-2.5"
                      data-cursor="Source"
                    >
                      <Github size={13} />
                      <span>Source</span>
                    </a>
                  ) : !project.inDevelopment && SHOW_PLACEHOLDERS ? (
                    <span
                      className="font-mono text-[11px] text-muted border border-dashed border-border px-2 py-0.5 rounded bg-surface/40"
                      title={project.links.github.todoNote}
                    >
                      [Source Pending]
                    </span>
                  ) : null
                )}

                {/* Live Demo Link */}
                {project.links.live && (
                  project.links.live.url ? (
                    <a
                      href={project.links.live.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-editorial text-xs py-1 px-2.5"
                      data-cursor="Open Live"
                    >
                      <ExternalLink size={13} />
                      <span>Live</span>
                    </a>
                  ) : !project.inDevelopment && SHOW_PLACEHOLDERS ? (
                    <span
                      className="font-mono text-[11px] text-muted border border-dashed border-border px-2 py-0.5 rounded bg-surface/40"
                      title={project.links.live.todoNote}
                    >
                      [Live Pending]
                    </span>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
