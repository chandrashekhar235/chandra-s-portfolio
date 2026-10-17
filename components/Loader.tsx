'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import portraitPointsData from '@/public/portrait-points.json'

// 14 SKILL NODES shown during the network phase
const RESUME_SKILLS = [
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'JavaScript',
  'TypeScript',
  'Next.js',
  'PostgreSQL',
  'Prisma',
  'WebRTC',
  'Socket.io',
  'C++',
  'Python',
  'Git',
]

interface LoaderProps {
  onComplete?: () => void
}

interface Particle {
  // Initial Network Position
  netX: number
  netY: number
  vx: number
  vy: number
  // Target Portrait Position
  targetX: number
  targetY: number
  // Current Interpolated Position
  x: number
  y: number
  size: number
  isLabelNode: boolean
  label: string
}

interface Pulse {
  edgeIndex: number
  progress: number // 0 to 1 along edge
  speed: number
}

export default function Loader({ onComplete }: LoaderProps) {
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<'network' | 'forming' | 'opening' | 'done'>('network')
  const [isRepeat, setIsRepeat] = useState(false)
  const [isSkipped, setIsSkipped] = useState(false)
  const [preloaded, setPreloaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const profileImgRef = useRef<HTMLImageElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const animStateRef = useRef({
    networkProgress: 0,
    formingProgress: 0,
    openingProgress: 0,
    curtainTop: 0,
    curtainBottom: 0,
    labelAlpha: 1,
    meshAlpha: 1,
    photoAlpha: 0,
  })

  // Dismiss / Complete callback
  const handleDismiss = useCallback(() => {
    setIsSkipped(true)
    setPhase('done')
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('js_loader_seen', 'true')
    }
    if (timelineRef.current) {
      timelineRef.current.kill()
    }
    if (onComplete) onComplete()
  }, [onComplete])

  // 1. Initial Checks (URL params, reduced-motion, repeat visit, preloads)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check ?noloader flag
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('noloader')) {
      handleDismiss()
      return
    }

    // Check prefers-reduced-motion or Save-Data
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } })?.connection?.saveData === true
    if (reducedMotion || saveData) {
      handleDismiss()
      return
    }

    // Check repeat visit in same session
    const PLAY_EVERY_TIME = true
    if (!PLAY_EVERY_TIME && sessionStorage.getItem('js_loader_seen')) {
      setIsRepeat(true)
    }
    setMounted(true)

    // Preload profile cutout image and fonts
    const img = new window.Image()
    img.src = '/profile.jpg'
    img.onload = () => {
      profileImgRef.current = img
      if (document.fonts) {
        document.fonts.ready.then(() => setPreloaded(true)).catch(() => setPreloaded(true))
      } else {
        setPreloaded(true)
      }
    }
    img.onerror = () => setPreloaded(true)

    // Keyboard listener for skip
    const handleKeyDown = () => {
      handleDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleDismiss])

  // 2. Canvas Animation Controller
  useEffect(() => {
    if (!mounted || isSkipped || isRepeat) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const isMobile = width < 768
    const pointsRaw = isMobile ? portraitPointsData.mobilePoints : portraitPointsData.points
    const edgesRaw = isMobile ? portraitPointsData.mobileEdges : portraitPointsData.edges

    // Portrait target bounding box (centered in viewport)
    const targetSize = Math.min(width * 0.72, height * 0.64, 460)
    const targetLeft = (width - targetSize) / 2
    const targetTop = (height - targetSize) / 2 + 10

    // Assign 14 resume skill labels to the most prominent facial/contour nodes
    const labelCount = isMobile ? 8 : 14
    const labelSkills = RESUME_SKILLS.slice(0, labelCount)

    // Initialize particles
    const particles: Particle[] = pointsRaw.map(([nx, ny], idx) => {
      const isLabelNode = idx < labelCount
      const label = isLabelNode ? labelSkills[idx] : ''

      // Network initial coordinate: distributed across screen with central clustering
      const angle = (idx / pointsRaw.length) * Math.PI * 2
      const radius = 60 + Math.random() * (Math.min(width, height) * 0.42)
      const netX = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 80
      const netY = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 80

      const targetX = targetLeft + nx * targetSize
      const targetY = targetTop + ny * targetSize

      return {
        netX: Math.max(20, Math.min(width - 20, netX)),
        netY: Math.max(40, Math.min(height - 40, netY)),
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        targetX,
        targetY,
        x: netX,
        y: netY,
        size: isLabelNode ? 2.8 : 1.5,
        isLabelNode,
        label,
      }
    })

    // Active network pulses along edges during Phase 1
    const activePulses: Pulse[] = []
    const numPulses = isMobile ? 3 : 7
    for (let p = 0; p < numPulses; p++) {
      activePulses.push({
        edgeIndex: Math.floor(Math.random() * Math.min(60, edgesRaw.length)),
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
      })
    }

    // Spatial hash grid for fast O(N) neighbor lookups during Network phase
    const spatialCellSize = 100
    function buildSpatialGrid() {
      const grid = new Map<string, number[]>()
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]
        const gx = Math.floor(pt.x / spatialCellSize)
        const gy = Math.floor(pt.y / spatialCellSize)
        const key = `${gx}_${gy}`
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key)!.push(i)
      }
      return grid
    }

    // FPS Monitor for dropping heavy effects on low-end mobile
    let lastTime = performance.now()
    let frameCount = 0
    let dropPulses = isMobile

    // GSAP Master Sequence Timeline
    const state = animStateRef.current
    const tl = gsap.timeline({
      onComplete: () => {
        handleDismiss()
      },
    })
    timelineRef.current = tl

    // Phase 1: Network (0 to 0.9s)
    tl.to(state, {
      networkProgress: 1,
      duration: 0.9,
      ease: 'power1.out',
      onStart: () => setPhase('network'),
    })

    // Phase 2: Forming into Portrait (0.9 to 2.3s)
    tl.to(
      state,
      {
        formingProgress: 1,
        duration: 1.4,
        ease: 'power3.inOut',
        onStart: () => setPhase('forming'),
      },
      0.9
    )

    // Fade out labels during forming
    tl.to(
      state,
      {
        labelAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
      },
      1.1
    )

    // Phase 3: Opening into Hero Shared Element (2.3 to 3.0s)
    tl.to(
      state,
      {
        openingProgress: 1,
        photoAlpha: 1,
        meshAlpha: 0,
        curtainTop: -100,
        curtainBottom: 100,
        duration: 0.7,
        ease: 'power2.inOut',
        onStart: () => setPhase('opening'),
      },
      2.3
    )

    // Render loop driven by GSAP Ticker for 60fps frame synchronization
    const render = () => {
      // Check FPS
      const now = performance.now()
      frameCount++
      if (now - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (now - lastTime)
        if (fps < 55) dropPulses = true
        frameCount = 0
        lastTime = now
      }

      // 1. Clear background to Ink (#141413)
      ctx.fillStyle = '#141413'
      ctx.fillRect(0, 0, width, height)

      const fProg = state.formingProgress

      // 2. Update particle positions (Network drift -> ease to portrait)
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]
        if (fProg < 0.001) {
          // Subtle drifting in Network phase
          pt.netX += pt.vx
          pt.netY += pt.vy
          if (pt.netX < 15 || pt.netX > width - 15) pt.vx *= -1
          if (pt.netY < 35 || pt.netY > height - 35) pt.vy *= -1
          pt.x = pt.netX
          pt.y = pt.netY
        } else {
          // Smooth interpolation from current network position to portrait target
          pt.x = pt.netX + (pt.targetX - pt.netX) * fProg
          pt.y = pt.netY + (pt.targetY - pt.netY) * fProg
        }
      }

      // 3. Draw Lines & Connections
      if (state.meshAlpha > 0.01) {
        ctx.lineWidth = 0.8
        const maxDistSq = 85 * 85

        if (fProg < 0.6) {
          // Phase 1 / Early Phase 2: Dynamic network connections via spatial grid
          const grid = buildSpatialGrid()
          ctx.strokeStyle = `rgba(251, 249, 245, ${0.14 * (1 - fProg)})`
          ctx.beginPath()

          for (let i = 0; i < particles.length; i++) {
            const pt = particles[i]
            const gx = Math.floor(pt.x / spatialCellSize)
            const gy = Math.floor(pt.y / spatialCellSize)
            let linesDrawn = 0

            for (let dx = -1; dx <= 1 && linesDrawn < 3; dx++) {
              for (let dy = -1; dy <= 1 && linesDrawn < 3; dy++) {
                const cell = grid.get(`${gx + dx}_${gy + dy}`)
                if (!cell) continue
                for (const j of cell) {
                  if (j <= i) continue
                  const other = particles[j]
                  const dSq = (pt.x - other.x) * (pt.x - other.x) + (pt.y - other.y) * (pt.y - other.y)
                  if (dSq < maxDistSq) {
                    ctx.moveTo(pt.x, pt.y)
                    ctx.lineTo(other.x, other.y)
                    linesDrawn++
                    if (linesDrawn >= 3) break
                  }
                }
              }
            }
          }
          ctx.stroke()

          // Draw active travelling pulses along network edges
          if (!dropPulses && fProg < 0.2) {
            ctx.fillStyle = '#E5633C'
            for (const pulse of activePulses) {
              pulse.progress += pulse.speed
              if (pulse.progress > 1) {
                pulse.progress = 0
                pulse.edgeIndex = Math.floor(Math.random() * Math.min(80, edgesRaw.length))
              }
              const edge = edgesRaw[pulse.edgeIndex]
              if (edge) {
                const p1 = particles[edge[0]]
                const p2 = particles[edge[1]]
                if (p1 && p2) {
                  const px = p1.x + (p2.x - p1.x) * pulse.progress
                  const py = p1.y + (p2.y - p1.y) * pulse.progress
                  ctx.beginPath()
                  ctx.arc(px, py, 2.2, 0, Math.PI * 2)
                  ctx.fill()
                }
              }
            }
          }
        }

        // Phase 2 / 3: Draw precomputed portrait plexus mesh
        if (fProg > 0.3) {
          const meshOpacity = Math.min(1, (fProg - 0.3) / 0.7) * state.meshAlpha
          ctx.strokeStyle = `rgba(251, 249, 245, ${0.2 * meshOpacity})`
          ctx.beginPath()

          for (let e = 0; e < edgesRaw.length; e++) {
            const [i, j] = edgesRaw[e]
            const p1 = particles[i]
            const p2 = particles[j]
            if (p1 && p2) {
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
            }
          }
          ctx.stroke()
        }
      }

      // 4. Draw Particles (Dots in Accent Color)
      if (state.meshAlpha > 0.01) {
        ctx.fillStyle = '#E5633C'
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i]
          const size = (pt.isLabelNode ? 2.5 : 1.4) * state.meshAlpha
          ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size)
        }
      }

      // 5. Draw Resume Skill Labels (Fade out during forming)
      if (state.labelAlpha > 0.02) {
        ctx.font = '10px monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'

        for (let i = 0; i < labelCount; i++) {
          const pt = particles[i]
          if (pt.label) {
            ctx.fillStyle = `rgba(251, 249, 245, ${0.85 * state.labelAlpha})`
            ctx.fillText(pt.label, pt.x + 8, pt.y)
          }
        }
      }

      // 6. Real Cutout Photo Reveal (Phase 3: Fades in exactly over settled points)
      if (state.photoAlpha > 0.01 && profileImgRef.current) {
        ctx.save()
        ctx.globalAlpha = state.photoAlpha
        ctx.drawImage(profileImgRef.current, targetLeft, targetTop, targetSize, targetSize)
        ctx.restore()
      }
    }

    // Register with GSAP ticker
    gsap.ticker.add(render)

    // Window Resize Handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', handleResize)

    // Visibility Change: pause when tab is hidden to save CPU/battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tl.pause()
      } else {
        tl.resume()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      gsap.ticker.remove(render)
      tl.kill()
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [mounted, isSkipped, isRepeat, handleDismiss])

  if (!mounted || isSkipped || phase === 'done') return null

  // Fast 0.5s repeat visit mode (Split curtain only)
  if (isRepeat) {
    return (
      <div
        className="fixed inset-0 z-[99999] pointer-events-none flex flex-col"
        onAnimationEnd={handleDismiss}
        aria-hidden="true"
      >
        <div className="w-full h-1/2 bg-[#141413] animate-curtain-top" />
        <div className="w-full h-1/2 bg-[#141413] animate-curtain-bottom" />
        <style jsx>{`
          @keyframes curtainTop {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
          @keyframes curtainBottom {
            0% { transform: translateY(0); }
            100% { transform: translateY(100%); }
          }
          .animate-curtain-top {
            animation: curtainTop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .animate-curtain-bottom {
            animation: curtainBottom 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[99999] select-none flex flex-col justify-between overflow-hidden bg-[#141413]"
      onClick={handleDismiss}
      aria-hidden="true"
    >
      {/* Screen Reader Accessible Live Status */}
      <span className="sr-only" role="status" aria-live="polite">
        Loading Chandra Shekhar&apos;s Engineering Portfolio
      </span>

      {/* Main High-Performance 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full bg-[#141413]"
      />

      {/* Top Header Information & Skip Action */}
      <div className="relative z-20 flex items-center justify-between p-5 sm:p-6 font-mono text-xs text-[#9E9A92] pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[#ECEAE4] font-semibold">CHANDRA</span>
          <span>{'//'}</span>
          <span className="uppercase text-[11px]">
            {phase === 'network' && '01. Skills Network Awakening'}
            {phase === 'forming' && '02. Forming Portrait Plexus'}
            {phase === 'opening' && '03. Continuous Handoff'}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className="pointer-events-auto min-h-[44px] min-w-[44px] px-3.5 py-2 rounded border border-white/20 bg-white/5 text-[#ECEAE4] hover:bg-white/15 text-[12px] font-mono transition-colors flex items-center justify-center cursor-pointer"
          title="Skip intro animation"
          aria-label="Skip intro animation"
        >
          <span>Skip</span>
          <span className="hidden sm:inline">&nbsp;[Esc]</span>
        </button>
      </div>

      {/* Bottom Stage Narrative */}
      <div className="relative z-20 flex items-end justify-between p-5 sm:p-6 font-mono text-[11px] text-[#9E9A92] border-t border-white/10 pointer-events-none">
        <div>
          <span className="text-accent font-semibold">Sequence:</span> Modules &rarr; Network &rarr; Me
        </div>
        <div className="hidden sm:block">
          Full-Stack Systems &bull; Real-Time Apps &bull; Final Year
        </div>
      </div>

      {/* Split Curtain Exit Transition during Opening Phase */}
      {phase === 'opening' && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col">
          <div className="w-full h-1/2 bg-[#141413] animate-curtain-top" />
          <div className="w-full h-1/2 bg-[#141413] animate-curtain-bottom" />
        </div>
      )}

      <style jsx>{`
        @keyframes curtainTop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        @keyframes curtainBottom {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        .animate-curtain-top {
          animation: curtainTop 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-curtain-bottom {
          animation: curtainBottom 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  )
}
