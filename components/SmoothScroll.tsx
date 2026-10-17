'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 2. Check touch device / coarse pointer (native momentum scrolling feels best on mobile)
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window

    // 3. Check Save-Data client hint
    const isSaveData = (navigator as any).connection?.saveData === true

    if (prefersReducedMotion || isTouch || isSaveData) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const animId = requestAnimationFrame(raf)

    // Intercept internal hash links for smooth scroll on desktop
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (href && href.startsWith('#') && href.length > 1) {
        const element = document.querySelector(href)
        if (element) {
          e.preventDefault()
          lenis.scrollTo(element as HTMLElement, { offset: -70 })
        }
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('click', handleClick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
