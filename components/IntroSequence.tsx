'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroSequence() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user already saw the intro this session or requested reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen = typeof window !== 'undefined' && sessionStorage.getItem('js_intro_seen')

    if (reducedMotion || alreadySeen) {
      return
    }

    setShow(true)

    const timer = setTimeout(() => {
      dismiss()
    }, 1100)

    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setShow(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('js_intro_seen', 'true')
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
          onClick={dismiss}
          className="fixed inset-0 z-50 flex items-center justify-center bg-paper cursor-pointer select-none"
          title="Click to skip"
          role="dialog"
          aria-label="Welcome Introduction"
        >
          <div className="relative flex flex-col items-center">
            {/* Display Initials */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-6xl sm:text-7xl font-bold tracking-tight text-ink"
            >
              JS
            </motion.div>

            {/* Subtle Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="mt-3 font-mono text-xs text-muted uppercase tracking-widest"
            >
              Chandra Shekhar
            </motion.div>

            {/* Tap/Click hint */}
            <span className="absolute -bottom-12 font-mono text-[10px] text-muted/60">
              [Click or press any key to skip]
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
