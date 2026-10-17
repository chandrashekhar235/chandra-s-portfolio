import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper text-ink p-6 sm:p-12 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between font-mono text-xs text-muted border-b border-border pb-4">
        <span>Chandra Shekhar — Portfolio</span>
        <span>ERROR_404_INDEX_MISSING</span>
      </div>

      {/* Main 404 Narrative */}
      <div className="max-w-2xl my-auto py-12">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block mb-3">
          Plate Missing // Unindexed Route
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-normal tracking-tight mb-4 text-ink">
          404 — Document Not Found
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed mb-8">
          The requested project or route could not be found. Please return to the portfolio home.
        </p>

        <Link
          href="/"
          className="btn-editorial inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Return to Portfolio</span>
        </Link>
      </div>

      {/* Bottom Footer Note */}
      <div className="font-mono text-[11px] text-muted border-t border-border pt-4 flex items-center justify-between">
        <span>Chandra Shekhar</span>
        <span>Delhi, India</span>
      </div>
    </div>
  )
}
