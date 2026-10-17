'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

const SECTIONS = [
  { id: 'projects', label: '01. Projects' },
  { id: 'proof-piece', label: '02. Pipeline' },
  { id: 'experience', label: '03. Experience' },
  { id: 'skills', label: '04. Stack' },
  { id: 'contact', label: '05. Contact' },
]

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  })

  const [activeSection, setActiveSection] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const isVisibleRef = useRef<boolean>(false)
  const isInteractingRef = useRef<boolean>(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear the hide timer safely
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  // Schedule fade-out after 1.5s of no scroll activity
  const scheduleHide = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      // Keep visible if user is currently hovering or focusing on the index
      if (!isInteractingRef.current) {
        isVisibleRef.current = false
        setIsVisible(false)
      }
    }, 1500)
  }, [clearHideTimer])

  // Reveal index on scroll and reset the 1.5s inactivity timer
  const showIndex = useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true
      setIsVisible(true)
    }
    scheduleHide()
  }, [scheduleHide])

  // Mouse & Touch interaction handlers
  const handleMouseEnter = () => {
    isInteractingRef.current = true
    clearHideTimer()
  }

  const handleMouseLeave = () => {
    isInteractingRef.current = false
    scheduleHide()
  }

  const handleFocus = () => {
    isInteractingRef.current = true
    if (!isVisibleRef.current) {
      isVisibleRef.current = true
      setIsVisible(true)
    }
    clearHideTimer()
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    isInteractingRef.current = false
    scheduleHide()
  }

  useEffect(() => {
    const onScroll = () => {
      showIndex()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
      if (scrollKeys.includes(e.key)) {
        showIndex()
      }
    }

    // Capture scrolling across mouse wheel, touch drag, trackpad, and keyboard
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onScroll, { passive: true })
    window.addEventListener('touchmove', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown, { passive: true })

    // Active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0,
      }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onScroll)
      window.removeEventListener('touchmove', onScroll)
      window.removeEventListener('keydown', onKeyDown)
      observer.disconnect()
      clearHideTimer()
    }
  }, [showIndex, clearHideTimer])

  return (
    <>
      {/* Hairline Scroll Progress Bar at the top of the viewport */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Floating Section Index: Appears on scroll, fades out 1.5s after scrolling stops */}
      <nav
        aria-label="Section Index"
        aria-hidden={!isVisible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3.5 p-3 rounded bg-paper/85 backdrop-blur-md border border-border/80 text-[11px] font-mono shadow-xs select-none transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none motion-reduce:translate-x-0 ${
          isVisible
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        <span className="text-[9px] uppercase tracking-widest text-muted border-b border-border pb-1">
          Index
        </span>
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id
          return (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              tabIndex={isVisible ? 0 : -1}
              onClick={() => scheduleHide()}
              className={`flex items-center gap-2 transition-colors duration-200 no-underline ${
                isActive ? 'text-accent font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-accent scale-125' : 'bg-border'
                }`}
              />
              <span>{sec.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}
