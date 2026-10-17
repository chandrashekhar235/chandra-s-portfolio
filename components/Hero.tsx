'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { PERSONAL_INFO } from '@/lib/content'
import { FileDown, Github, Linkedin, Mail, MapPin, GraduationCap } from 'lucide-react'
import MagneticButton from './MagneticButton'

const ROLES = [
  'Full Stack Developer & UI/UX Designer',
  'React + Node.js (MERN) Engineer',
  'Real-Time Systems (WebRTC & Socket.io)',
]

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle scroll parallax on the cutout portrait (reduced on coarse pointers)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const portraitY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])

  // Role ticker cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length)
    }, 3600)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative min-h-[90dvh] sm:min-h-[92dvh] pt-6 sm:pt-14 pb-14 sm:pb-20 border-b border-border overflow-hidden flex flex-col justify-center"
    >
      {/* Corner Crop Marks for Printed Proof Aesthetic */}
      <div className="absolute top-3 left-4 font-mono text-[10px] text-muted/60 select-none hidden lg:block">
        + PROOF_TL [0,0]
      </div>
      <div className="absolute top-3 right-4 font-mono text-[10px] text-muted/60 select-none hidden lg:block">
        + PROOF_TR [1180,0]
      </div>

      <div className="container-editorial relative w-full">
        {/* Meta Kicker & Margin Annotation */}
        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 font-mono text-xs text-muted mb-4 sm:mb-6">
          <span className="flex items-center gap-1.5 text-ink font-medium">
            <GraduationCap size={14} className="text-accent flex-shrink-0" />
            <span>Final-Year Engineering Student</span>
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1">
            <MapPin size={13} className="flex-shrink-0" />
            <span>Delhi, India</span>
          </span>
          <span className="text-border hidden md:inline">•</span>
          <span className="font-mono text-[11px] text-accent font-semibold hidden md:inline">
            Fig. 00 — Dossier
          </span>
        </div>

        {/* Editorial "Cutout Over Headline" Layered Stage */}
        <div className="relative mb-6 sm:mb-8 pt-1">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-4 sm:gap-6 items-end relative">
            {/* Left Layer: Name and Core Pitch */}
            <div className="relative z-10 flex flex-col justify-end">
              {/* Line 1: Behind Head/Shoulder Plane */}
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[clamp(2.4rem,9.8vw,8.5rem)] font-normal tracking-tight text-ink leading-[0.88] select-none break-words"
                >
                  Chandra
                </motion.h1>
              </div>

              {/* Line 2: Interleaved with Cutout */}
              <div className="overflow-hidden relative z-30">
                <motion.div
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[clamp(2.4rem,9.8vw,8.5rem)] font-normal tracking-tight text-ink leading-[0.88] select-none break-words"
                >
                  Shekhar
                </motion.div>
              </div>
            </div>

            {/* Right Layer: Transparent Cutout Standing Directly on Background */}
            <div className="relative z-20 flex flex-col items-center lg:items-end -mt-4 sm:-mt-8 lg:-mt-16">
              <motion.div
                style={{ y: portraitY }}
                className="relative w-44 xs:w-52 sm:w-72 lg:w-[360px] select-none"
              >
                {/* Cutout Image */}
                <div className="relative aspect-square w-full">
                  <Image
                    src="/profile.jpg"
                    alt={PERSONAL_INFO.name}
                    width={520}
                    height={520}
                    priority
                    sizes="(max-width: 480px) 210px, (max-width: 768px) 290px, 360px"
                    className="w-full h-auto object-contain drop-shadow-none transition-all duration-300"
                  />
                </div>

                {/* Minimalist Baseline Grounding */}
                <div className="mt-1 pt-1.5 border-t border-border/80 flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>Chandra Shekhar</span>
                  <span className="text-accent font-medium">Delhi, IN</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Narrative & Focus Row */}
        <div className="max-w-3xl">
          {/* Vertical Ticker for Engineering Roles */}
          <div className="h-7 sm:h-8 mb-3 sm:mb-4 overflow-hidden flex items-center">
            <span className="font-mono text-xs text-muted uppercase tracking-wider mr-2.5">
              Focus:
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono text-xs sm:text-base text-accent font-semibold tracking-tight"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Plain candid summary statement */}
          <p className="text-sm sm:text-lg text-muted leading-relaxed mb-6 sm:mb-8 font-sans">
            {PERSONAL_INFO.summary}
          </p>

          {/* Magnetic Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <MagneticButton>
              <a
                href={PERSONAL_INFO.resumePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial min-h-[44px] min-w-[44px] items-center text-xs sm:text-sm"
                data-cursor="Resume"
              >
                <FileDown size={16} />
                <span>Download Resume</span>
              </a>
            </MagneticButton>

            <MagneticButton>
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-[44px] min-w-[44px] items-center text-xs sm:text-sm"
                data-cursor="GitHub"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
            </MagneticButton>

            <MagneticButton>
              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-[44px] min-w-[44px] items-center text-xs sm:text-sm"
                data-cursor="LinkedIn"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </MagneticButton>

            <MagneticButton>
              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="btn-secondary min-h-[44px] min-w-[44px] items-center text-xs sm:text-sm"
                data-cursor="Email"
              >
                <Mail size={16} />
                <span>Email</span>
              </a>
            </MagneticButton>
          </div>

          {/* Recruiter Fast Proof Anchor Bar */}
          <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-border flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-mono text-muted">
            <span className="text-ink font-semibold">Fast Proof:</span>
            <a
              href="#projects"
              className="text-accent hover:underline link-draw min-h-[44px] inline-flex items-center gap-1"
              data-cursor="View"
            >
              <span>01. Learn Bridge (Real-Time Platform)</span>
            </a>
            <span className="text-border hidden xs:inline">•</span>
            <a
              href="#proof-piece"
              className="text-accent hover:underline link-draw min-h-[44px] inline-flex items-center gap-1"
              data-cursor="Explore"
            >
              <span>02. System Pipeline</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
