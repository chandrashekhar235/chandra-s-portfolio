import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TechMarquee from '@/components/TechMarquee'
import ProjectEntry from '@/components/ProjectEntry'
import AgentPipeline from '@/components/AgentPipeline'
import ExperienceList from '@/components/ExperienceList'
import SkillsCerts from '@/components/SkillsCerts'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import Loader from '@/components/Loader'
import CustomCursor from '@/components/CustomCursor'
import ScrollProgress from '@/components/ScrollProgress'
import { PROJECTS } from '@/lib/content'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink transition-colors duration-200 relative w-full max-w-full overflow-x-clip">
      {/* Static Subtle Paper Grain Overlay */}
      <div className="paper-grain" aria-hidden="true" />

      {/* Signature Data -> Model -> Product Loading Sequence */}
      <Loader />

      {/* Interactive Custom Cursor (Fine Pointers Only) */}
      <CustomCursor />

      {/* Top Hairline Scroll Progress & Fixed Margin Index */}
      <ScrollProgress />

      {/* Editorial Sticky Masthead Header */}
      <Header />

      <main className="flex-1 min-w-0 w-full overflow-x-clip">
        {/* Recruiter-Optimized Above-the-fold Hero with Masked Reveal & Ticker */}
        <Hero />

        {/* Slow Text-Only Tech Marquee */}
        <TechMarquee />

        {/* Projects: 4 Entries with Stacking Parallax Numerals */}
        <section id="projects" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 relative">
          <div className="container-editorial">
            {/* Section Header */}
            <div className="mb-12 sm:mb-16">
              <div className="font-mono text-xs text-accent font-semibold tracking-wider uppercase mb-2">
                Projects
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-3">
                Top Projects
              </h2>
              <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
                Full-stack platforms with real-time voice, secure authentication, and machine learning.
              </p>
            </div>

            {/* 4 Projects in Order with Stacking Parallax Numerals */}
            <div className="divide-y divide-border">
              {PROJECTS.map((project, index) => (
                <ProjectEntry
                  key={project.id}
                  project={project}
                  index={index}
                  totalProjects={PROJECTS.length}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Showpiece: Interactive Agent Pipeline Explorer with Animated Packets */}
        <AgentPipeline />

        {/* Work Experience: Inverse Dark Section for Magazine Rhythm Break */}
        <ExperienceList />

        {/* Technical Skills & Certifications */}
        <SkillsCerts />

        {/* Working Contact Form with Clipboard Feedback & Mail Providers */}
        <ContactForm />
      </main>

      {/* Large Full-Width Wordmark Editorial Footer */}
      <Footer />
    </div>
  )
}
