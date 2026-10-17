'use client'

import { useState, useRef } from 'react'

interface TextScrambleProps {
  text: string
  className?: string
  scrambleChars?: string
}

const DEFAULT_CHARS = '0123456789_!<>#/~@'

export default function TextScramble({
  text,
  className = '',
  scrambleChars = DEFAULT_CHARS,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text)
  const isScrambling = useRef(false)

  const handleMouseEnter = () => {
    if (isScrambling.current) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    isScrambling.current = true
    let iteration = 0
    const maxIterations = 8
    const intervalMs = 25

    const interval = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) return text[index]
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          })
          .join('')
      )

      iteration += 1

      if (iteration > maxIterations) {
        clearInterval(interval)
        setDisplayText(text)
        isScrambling.current = false
      }
    }, intervalMs)
  }

  return (
    <span onMouseEnter={handleMouseEnter} className={`inline-block font-mono ${className}`}>
      {displayText}
    </span>
  )
}
