'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'

const MARQUEE_ITEMS = [
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'WebRTC',
  'Socket.io',
  'Next.js',
  'TypeScript',
  'PostgreSQL',
  'Prisma',
  'Python',
  'C++',
  'JavaScript',
  'Git',
  'Figma',
]

export default function TechMarquee() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div className="py-6 border-y border-border bg-surface/30 overflow-hidden relative group select-none">
      <div className="flex items-center">
        {/* Pause / Play Control */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute left-2 sm:left-4 z-20 min-h-[44px] min-w-[44px] p-2 rounded bg-paper border border-border text-muted hover:text-ink shadow-xs transition-opacity opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 flex items-center justify-center"
          title={isPaused ? 'Resume Marquee' : 'Pause Marquee'}
          aria-label={isPaused ? 'Resume Tech Marquee' : 'Pause Tech Marquee'}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>

        {/* Marquee Track (Double duplicate for seamless loop) */}
        <div
          className={`flex items-center gap-8 whitespace-nowrap font-mono text-xs text-muted uppercase tracking-widest ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{
            animationDuration: '32s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 flex-shrink-0">
              <span className="hover:text-ink transition-colors cursor-default">{item}</span>
              <span className="text-accent/60 text-[10px]">•</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation-name: marquee;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
