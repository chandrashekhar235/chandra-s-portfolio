'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  maxOffset?: number
}

export default function MagneticButton({
  children,
  className = '',
  strength = 0.15,
  maxOffset = 6,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isFinePointer, setIsFinePointer] = useState(false)

  useEffect(() => {
    const checkPointer = () => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      setIsFinePointer(fine)
    }
    checkPointer()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFinePointer || !ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()

    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)

    const pullX = Math.max(-maxOffset, Math.min(maxOffset, middleX * strength))
    const pullY = Math.max(-maxOffset, Math.min(maxOffset, middleY * strength))

    setPosition({ x: pullX, y: pullY })
  }

  const handleMouseLeave = () => {
    if (!isFinePointer) return
    setPosition({ x: 0, y: 0 })
  }

  if (!isFinePointer) {
    return <div className={`inline-block ${className}`}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}
