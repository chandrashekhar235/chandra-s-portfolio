'use client'

import { useState, useEffect, useRef } from 'react'
import { PERSONAL_INFO } from '@/lib/content'
import { FileDown, Github, Linkedin, Mail, Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function Header() {
  const { theme, toggle } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
        toggleBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-border transition-colors duration-200">
        <div className="container-editorial">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Masthead Identity */}
            <div className="flex flex-col flex-shrink-0">
              <a href="#top" className="group text-inherit no-underline">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-ink group-hover:text-accent transition-colors whitespace-nowrap">
                  {PERSONAL_INFO.name}
                </span>
              </a>
              <span className="font-mono text-[11px] text-muted hidden sm:inline tracking-tight whitespace-nowrap">
                Full Stack • UI/UX • Delhi, IN
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-6 font-mono text-xs text-muted">
              <a href="#projects" className="hover:text-ink transition-colors no-underline">
                Projects
              </a>
              <a href="#proof-piece" className="hover:text-ink transition-colors no-underline">
                System Pipeline
              </a>
              <a href="#experience" className="hover:text-ink transition-colors no-underline">
                Experience
              </a>
              <a href="#skills" className="hover:text-ink transition-colors no-underline">
                Skills
              </a>
              <a href="#contact" className="hover:text-ink transition-colors no-underline">
                Contact
              </a>
            </nav>

            {/* Quick Action Links & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <a
                href={PERSONAL_INFO.resumePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex btn-editorial text-xs sm:text-sm py-1.5 px-3 min-h-[44px] items-center"
              >
                <FileDown size={15} />
                <span>Resume</span>
              </a>

              <div className="hidden lg:flex items-center gap-1.5 pl-1 border-l border-border">
                <a
                  href={PERSONAL_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="p-2 text-muted hover:text-ink hover:bg-surface rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Github size={16} />
                </a>
                <a
                  href={PERSONAL_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="p-2 text-muted hover:text-ink hover:bg-surface rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href={`mailto:${PERSONAL_INFO.email}`}
                  aria-label="Email Chandra"
                  className="p-2 text-muted hover:text-ink hover:bg-surface rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Mail size={16} />
                </a>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={(e) => toggle(e)}
                aria-label="Toggle Color Theme"
                data-cursor="Theme"
                className="p-2 text-muted hover:text-ink hover:bg-surface rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Mobile/Tablet Menu Hamburger Button (< lg) */}
              <button
                ref={toggleBtnRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="lg:hidden p-2 text-ink hover:bg-surface rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-in/Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            ref={menuRef}
            className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-paper/98 backdrop-blur-xl border-b border-border z-50 flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <nav className="flex flex-col gap-2 font-display text-2xl sm:text-3xl text-ink">
              <a
                href="#projects"
                onClick={closeMenu}
                className="py-3 px-2 border-b border-border/50 hover:text-accent transition-colors flex items-center justify-between"
              >
                <span>Projects</span>
                <span className="font-mono text-xs text-muted">01</span>
              </a>
              <a
                href="#proof-piece"
                onClick={closeMenu}
                className="py-3 px-2 border-b border-border/50 hover:text-accent transition-colors flex items-center justify-between"
              >
                <span>System Pipeline</span>
                <span className="font-mono text-xs text-muted">02</span>
              </a>
              <a
                href="#experience"
                onClick={closeMenu}
                className="py-3 px-2 border-b border-border/50 hover:text-accent transition-colors flex items-center justify-between"
              >
                <span>Experience</span>
                <span className="font-mono text-xs text-muted">03</span>
              </a>
              <a
                href="#skills"
                onClick={closeMenu}
                className="py-3 px-2 border-b border-border/50 hover:text-accent transition-colors flex items-center justify-between"
              >
                <span>Skills</span>
                <span className="font-mono text-xs text-muted">04</span>
              </a>
              <a
                href="#contact"
                onClick={closeMenu}
                className="py-3 px-2 border-b border-border/50 hover:text-accent transition-colors flex items-center justify-between"
              >
                <span>Contact</span>
                <span className="font-mono text-xs text-muted">05</span>
              </a>
            </nav>

            <div className="pt-6 border-t border-border flex flex-col gap-4">
              <a
                href={PERSONAL_INFO.resumePdf}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="btn-editorial justify-center w-full py-3 text-base min-h-[48px]"
              >
                <FileDown size={18} />
                <span>Download Resume</span>
              </a>

              <div className="flex items-center justify-around pt-2">
                <a
                  href={PERSONAL_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink min-h-[44px] px-2"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
                <span className="text-border">•</span>
                <a
                  href={PERSONAL_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink min-h-[44px] px-2"
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
                <span className="text-border">•</span>
                <a
                  href={`mailto:${PERSONAL_INFO.email}`}
                  className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink min-h-[44px] px-2"
                >
                  <Mail size={16} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Slim Sticky Mobile Bottom Action Bar on Smartphones (< sm, hidden when menu open) */}
      {!mobileMenuOpen && (
        <div
          data-testid="mobile-bottom-bar"
          className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur-md border-t border-border px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg flex items-center gap-3 transition-transform"
          role="region"
          aria-label="Quick actions"
        >
          <a
            href={PERSONAL_INFO.resumePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-editorial justify-center py-2.5 text-xs font-mono font-medium min-h-[44px]"
          >
            <FileDown size={14} />
            <span>Resume</span>
          </a>
          <a
            href="#contact"
            className="flex-1 btn-secondary justify-center py-2.5 text-xs font-mono font-medium min-h-[44px]"
          >
            <Mail size={14} />
            <span>Get in Touch</span>
          </a>
        </div>
      )}
    </>
  )
}
