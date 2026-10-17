'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [cursorText, setCursorText] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring physics for smooth follow lag
  const springConfig = { stiffness: 450, damping: 32, mass: 0.6 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Only enable on fine pointer (desktop mouse) with hover capability and when not prefers-reduced-motion
    const hasFineHover = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!hasFineHover || reducedMotion) {
      return
    }

    setIsEnabled(true)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null
      
      if (cursorTarget) {
        const text = cursorTarget.getAttribute('data-cursor') || ''
        setCursorText(text)
        setIsHovered(true)
      } else if (target.closest('a, button, input, textarea, [role="button"]')) {
        setCursorText('')
        setIsHovered(true)
      } else {
        setCursorText('')
        setIsHovered(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [mouseX, mouseY])

  if (!isEnabled) return null

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-mono text-[10px] font-semibold tracking-wider text-white"
      style={{
        x: springX,
        y: springY,
      }}
    >
      <motion.div
        animate={{
          width: cursorText ? 'auto' : isHovered ? 28 : 8,
          height: cursorText ? 24 : isHovered ? 28 : 8,
          backgroundColor: cursorText
            ? 'var(--accent)'
            : isHovered
            ? 'var(--accent-subtle)'
            : 'var(--accent)',
          borderColor: isHovered ? 'var(--accent)' : 'transparent',
          borderWidth: isHovered && !cursorText ? 1.5 : 0,
          paddingLeft: cursorText ? 10 : 0,
          paddingRight: cursorText ? 10 : 0,
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-full flex items-center justify-center backdrop-blur-xs select-none shadow-xs whitespace-nowrap overflow-hidden"
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  )
}
