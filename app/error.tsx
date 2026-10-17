'use client'

import { useEffect } from 'react'
import { RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper text-ink p-6 sm:p-12 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between font-mono text-xs text-muted border-b border-border pb-4">
        <span>Chandra Shekhar — Portfolio</span>
        <span>SYSTEM_FAULT_RECOVERABLE</span>
      </div>

      {/* Main Error Narrative */}
      <div className="max-w-2xl my-auto py-12">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block mb-3">
          Runtime Exception // Graceful Degradation
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-normal tracking-tight mb-4 text-ink">
          An unexpected error occurred.
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed mb-6">
          The application encountered a transient client error. You can attempt to re-render the view
          or return safely to the portfolio home.
        </p>

        {error?.message && (
          <div className="p-3.5 mb-8 rounded-sm border border-border bg-surface font-mono text-xs text-muted overflow-x-auto">
            <code>{error.message}</code>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-editorial inline-flex items-center gap-2"
          >
            <RotateCcw size={15} />
            <span>Try again</span>
          </button>

          <Link
            href="/"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Home size={15} />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="font-mono text-[11px] text-muted border-t border-border pt-4 flex items-center justify-between">
        <span>Chandra Shekhar</span>
        <span>Delhi, India</span>
      </div>
    </div>
  )
}
