'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Server,
  BrainCircuit,
  Database,
  FileText,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

interface AgentStage {
  id: string
  num: string
  name: string
  icon: typeof Server
  role: string
  takesIn: string
  passesOn: string
  illustrativeInput: string
  illustrativeOutput: string
}

const AGENT_STAGES: AgentStage[] = [
  {
    id: 'gateway',
    num: '01',
    name: 'Express API',
    icon: Server,
    role: 'Authenticates the user with JWT or Google OAuth, validates the startup idea, and hands it to the Python AI engine.',
    takesIn: 'Startup idea text and an authenticated session.',
    passesOn: 'A validated JSON request for the AI engine.',
    illustrativeInput: `{
  "idea": "Marketplace connecting home chefs with office lunch orders",
  "session": "authenticated"
}`,
    illustrativeOutput: `{
  "status": "validated",
  "forwarded_to": "python_ai_engine"
}`,
  },
  {
    id: 'classifier',
    num: '02',
    name: 'Classifier',
    icon: BrainCircuit,
    role: 'Vectorises the idea with TF-IDF and classifies it as B2B or B2C using Logistic Regression.',
    takesIn: 'Validated idea text.',
    passesOn: 'A predicted business model with a confidence score.',
    illustrativeInput: `{
  "text": "Marketplace connecting home chefs with office lunch orders"
}`,
    illustrativeOutput: `{
  "business_model": "B2C",
  "confidence": 0.91
}`,
  },
  {
    id: 'retriever',
    num: '03',
    name: 'Retriever',
    icon: Database,
    role: 'Finds similar startups and market records in structured datasets using similarity-based retrieval.',
    takesIn: 'The idea vector and the predicted category.',
    passesOn: 'The closest startup and market records.',
    illustrativeInput: `{
  "vector": "tfidf(idea)",
  "top_k": 5
}`,
    illustrativeOutput: `{
  "matches": 5,
  "top_match_similarity": 0.78
}`,
  },
  {
    id: 'insights',
    num: '04',
    name: 'Insight Report',
    icon: FileText,
    role: 'Combines the classification and retrieved context into structured insights and returns them to the Node.js API as JSON.',
    takesIn: 'The category prediction and similar records.',
    passesOn: 'A structured insight payload rendered in the Next.js dashboard.',
    illustrativeInput: `{
  "business_model": "B2C",
  "matches": 5
}`,
    illustrativeOutput: `{
  "insights": ["market overview", "similar startups", "risks"],
  "format": "json"
}`,
  },
]

export default function AgentPipeline() {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Auto-play stepper
  useEffect(() => {
    if (!isAutoPlaying || reducedMotion) return
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % AGENT_STAGES.length)
    }, 4200)
    return () => clearInterval(interval)
  }, [isAutoPlaying, reducedMotion])

  const handleNext = useCallback(() => {
    setActiveStageIndex((prev) => (prev + 1) % AGENT_STAGES.length)
  }, [])

  const handlePrev = useCallback(() => {
    setActiveStageIndex((prev) => (prev - 1 + AGENT_STAGES.length) % AGENT_STAGES.length)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 45) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }

  const activeStage = AGENT_STAGES[activeStageIndex]
  const Icon = activeStage.icon

  return (
    <section id="proof-piece" className="scroll-mt-20 sm:scroll-mt-24 py-14 sm:py-20 border-t border-border bg-paper relative">
      <div className="container-editorial">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 font-mono text-xs text-accent font-semibold tracking-wider uppercase mb-2">
            <span>Proof of Systems Thinking</span>
            <span>•</span>
            <span>FoundrAI</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-3">
            Interactive System Pipeline Explorer
          </h2>
          <p className="text-sm sm:text-base text-muted max-w-3xl leading-relaxed">
            An interactive inspection tool showing how <strong>FoundrAI</strong> turns a startup idea into structured insights. Data packets travel between the Express API, the Python AI engine, and the retrieval layer.
          </p>
        </div>

        {/* Interactive Explorer Showpiece Card */}
        <div
          className="rounded-sm border border-border bg-surface p-5 sm:p-8 relative shadow-sm"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label="Interactive System Pipeline Explorer"
        >
          {/* Animated Data Pipeline Track */}
          <div className="mb-8 border-b border-border pb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles size={13} className="text-accent" />
                <span>Active Stage Flow // System Pipeline</span>
              </span>

              {/* Stepper Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="min-h-[44px] min-w-[44px] px-3 py-2 rounded border border-border bg-paper text-muted hover:text-ink hover:bg-surface-hover transition-colors font-mono text-xs flex items-center justify-center gap-1.5"
                  title={isAutoPlaying ? 'Pause Auto-Advance' : 'Auto-Advance Stages'}
                  aria-label={isAutoPlaying ? 'Pause auto-advance' : 'Auto-advance stages'}
                >
                  {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span className="hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto'}</span>
                </button>

                <button
                  onClick={handlePrev}
                  className="min-h-[44px] min-w-[44px] p-2 rounded border border-border bg-paper text-muted hover:text-ink hover:bg-surface-hover transition-colors flex items-center justify-center"
                  title="Previous Stage (Left Arrow)"
                  aria-label="Previous Stage"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={handleNext}
                  className="min-h-[44px] min-w-[44px] p-2 rounded border border-border bg-paper text-muted hover:text-ink hover:bg-surface-hover transition-colors flex items-center justify-center"
                  title="Next Stage (Right Arrow)"
                  aria-label="Next Stage"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* 4 Connected Agent Stage Cards */}
            <div role="tablist" aria-label="System pipeline stages" className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
              {AGENT_STAGES.map((stage, idx) => {
                const StageIcon = stage.icon
                const isActive = idx === activeStageIndex
                const isPassed = idx < activeStageIndex

                return (
                  <div key={stage.id} className="relative">
                    <button
                      onClick={() => {
                        setIsAutoPlaying(false)
                        setActiveStageIndex(idx)
                      }}
                      className={`w-full p-3 sm:p-4 rounded text-left transition-all duration-300 border ${
                        isActive
                          ? 'bg-paper text-ink border-accent shadow-xs scale-102 z-10'
                          : 'bg-surface text-ink/80 border-border hover:border-accent/40'
                      }`}
                      role="tab"
                      aria-selected={isActive}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-semibold text-accent">
                          {stage.num}.
                        </span>
                        <StageIcon
                          size={15}
                          className={isActive ? 'text-accent' : 'text-muted'}
                        />
                      </div>
                      <div className="font-display font-semibold text-sm sm:text-base text-ink mb-0.5">
                        {stage.name}
                      </div>
                      <div className="font-mono text-[10px] text-muted line-clamp-1">
                        {stage.role}
                      </div>
                    </button>

                    {/* Animated Data Packet Bead between stages (Desktop) */}
                    {idx < AGENT_STAGES.length - 1 && (
                      <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div className="w-4 h-[2px] bg-border relative overflow-hidden">
                          {!reducedMotion && isPassed && (
                            <motion.div
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                              className="w-2 h-full bg-accent rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Stage Details Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid lg:grid-cols-[1fr_1fr] gap-6 sm:gap-8 items-start"
            >
              {/* Left Column: Stage Role & Responsibilities */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded bg-paper border border-border flex items-center justify-center text-accent shadow-xs">
                    <Icon size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-xs text-muted tracking-wider uppercase">
                      Active Stage // {activeStage.num}
                    </span>
                    <h3 className="font-display font-semibold text-xl text-ink leading-tight">
                      {activeStage.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded border border-border bg-paper">
                    <span className="font-mono text-xs text-accent font-semibold block mb-1 uppercase tracking-wider">
                      Core Responsibility
                    </span>
                    <p className="text-ink/90 leading-relaxed text-sm">
                      {activeStage.role}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded border border-border bg-paper">
                      <span className="font-mono text-[11px] text-muted block mb-1 uppercase tracking-wider">
                        Takes In
                      </span>
                      <p className="text-xs text-ink/80 leading-relaxed">
                        {activeStage.takesIn}
                      </p>
                    </div>

                    <div className="p-3 rounded border border-border bg-paper">
                      <span className="font-mono text-[11px] text-muted block mb-1 uppercase tracking-wider">
                        Passes On
                      </span>
                      <p className="text-xs text-ink/80 leading-relaxed">
                        {activeStage.passesOn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Technical Payloads */}
              <div className="flex flex-col space-y-4">
                {/* Input Payload */}
                <div className="rounded border border-border bg-paper p-3.5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-muted mb-2 border-b border-border pb-1.5">
                    <span className="text-ink font-semibold">INPUT PAYLOAD</span>
                    <span className="text-accent text-[10px] uppercase tracking-wider font-mono">
                      [Illustrative Example]
                    </span>
                  </div>
                  <pre className="font-mono text-xs text-ink/90 overflow-x-auto leading-relaxed bg-surface/40 p-2.5 rounded border border-border/50">
                    <code>{activeStage.illustrativeInput}</code>
                  </pre>
                </div>

                {/* Output Artifact */}
                <div className="rounded border border-border bg-paper p-3.5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-muted mb-2 border-b border-border pb-1.5">
                    <span className="text-ink font-semibold">OUTPUT ARTIFACT</span>
                    <span className="text-accent text-[10px] uppercase tracking-wider font-mono">
                      [Illustrative Example]
                    </span>
                  </div>
                  <pre className="font-mono text-xs text-ink/90 overflow-x-auto leading-relaxed bg-surface/40 p-2.5 rounded border border-border/50">
                    <code>{activeStage.illustrativeOutput}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footnote & Keyboard Hint */}
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted">
            <span>Next.js + Express + Python AI Engine</span>
            <span className="text-[11px]">
              Use &larr; / &rarr; keys or swipe on touch to step through stages
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
