/**
 * SINGLE SOURCE OF TRUTH FOR PORTFOLIO CONTENT
 * Edit this file to change what appears on the site.
 */

export const SHOW_PLACEHOLDERS: boolean = process.env.NODE_ENV !== 'production'
export const SHOW_DRAFT_PROBLEMS: boolean = false
export const SHOW_LEADERSHIP: boolean = false

export interface ProjectLink {
  label: string
  url?: string
  isTodo?: boolean
  todoNote?: string
}

export interface Project {
  id: string
  title: string
  subtitle: string
  timeline: string
  role: string
  featured?: boolean
  inDevelopment?: boolean
  problem?: {
    text: string
    draft: true
  }
  whatIBuilt: string[]
  architectureOverview?: {
    label: string
    draft: true
    nodes: { id: string; label: string; sub: string }[]
    connections: { from: string; to: string; label?: string }[]
    confirmationNote: string
  }
  stack: string[]
  links: {
    github: ProjectLink
    live?: ProjectLink
    demoMedia?: ProjectLink
  }
  metricTodo?: string
}

export interface ExperienceItem {
  role: string
  company: string
  period: string
  location: string
  bullets: string[]
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface Certification {
  title: string
  issuer: string
  platform: string
}

export const PERSONAL_INFO = {
  name: 'Chandra Shekhar',
  headlineRoles: 'Full Stack Developer • UI/UX Designer',
  status: 'Final-year Engineering Student',
  institution: '',
  location: 'Delhi, India',
  email: 'chandrashekhar07005@gmail.com',
  github: 'https://github.com/chandrashekhar235',
  linkedin: 'https://www.linkedin.com/in/chandra-shekhar-a29789284',
  resumePdf:
    'https://drive.google.com/file/d/1hzzJm1ss8KoaKsomtbUuWagRATPYBTlV/view?usp=sharing',
  photo: '/profile.jpg',
  lastUpdated: 'October 2026',
  summary:
    'I build responsive, high-performance web applications with clean architecture and intuitive user experiences. Passionate about real-time systems, scalable APIs, and pixel-perfect design systems.',
}

export const LAST_UPDATED = 'October 2026'

export const PROJECTS: Project[] = [
  {
    id: 'learn-bridge',
    title: 'Learn Bridge',
    subtitle: 'Real-Time Collaborative Learning Platform with Voice Channels',
    timeline: '2025',
    role: 'Full Stack Developer',
    featured: true,
    whatIBuilt: [
      'Engineered low-latency WebRTC voice communication channels with active speaker visualizers.',
      'Built real-time study rooms with role-based member moderation and instant chat.',
      'Designed a dynamic study note feed with comments, bookmarking, and category tagging.',
      'Engineered secure JWT authentication and role-based permissions.',
    ],
    architectureOverview: {
      label: 'Simplified Overview',
      draft: true,
      nodes: [
        { id: 'client', label: 'React Client', sub: 'Study rooms + notes feed' },
        { id: 'api', label: 'Express API', sub: 'JWT auth + roles' },
        { id: 'rt', label: 'Real-Time Layer', sub: 'Socket.io + WebRTC' },
        { id: 'db', label: 'Database', sub: 'MongoDB' },
      ],
      connections: [
        { from: 'client', to: 'api', label: 'REST requests' },
        { from: 'client', to: 'rt', label: 'Chat + voice' },
        { from: 'api', to: 'db', label: 'Persist state' },
      ],
      confirmationNote: 'Simplified overview based on the project stack.',
    },
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'WebRTC', 'Socket.io'],
    links: {
      github: {
        label: 'Source Code',
        url: 'https://github.com/chandrashekhar235/learn-bridge',
        isTodo: false,
      },
      live: {
        label: 'Live Platform',
        url: 'https://learn-bridge-woad.vercel.app',
        isTodo: false,
      },
    },
  },
  {
  id: 'mind-scroll-ai',
  title: 'MindScroll AI',
  subtitle: 'ML-Powered Student Social Media & Mental Health Impact Predictor',
  timeline: '2025', // adjust to when you built it
  role: 'Full Stack & ML Developer',
  featured: true,
  whatIBuilt: [
    'Trained a Random Forest regression pipeline on 5,000 student survey responses to predict a mental health score from screen time, sleep, stress, and lifestyle habits (Test R² 0.864).',
    'Built a FastAPI backend with Pydantic validation serving prediction, what-if simulation, cohort insights, and model card endpoints.',
    'Designed a 4-step assessment wizard with an animated SVG score gauge, percentile rank, and a driving-factors waterfall showing what helps or strains the score.',
    'Created a real-time what-if habit simulator that shows score changes from lifestyle tweaks, plus an insights dashboard with 6 interactive charts and cohort filtering.',
    'Shipped a dual-theme (dark/light) responsive UI with Framer Motion animations, a Three.js signal orb, PDF report export, and an open model card for transparency.',
  ],
  architectureOverview: {
    label: 'Simplified Overview',
    draft: true,
    nodes: [
      { id: 'client', label: 'React Client', sub: 'Wizard, simulator + insights' },
      { id: 'api', label: 'FastAPI Backend', sub: 'Pydantic + REST endpoints' },
      { id: 'ml', label: 'ML Pipeline', sub: 'Scikit-learn Random Forest' },
      { id: 'data', label: 'Survey Dataset', sub: '5,000 student records' },
    ],
    connections: [
      { from: 'client', to: 'api', label: 'REST requests' },
      { from: 'api', to: 'ml', label: 'Feature transform + inference' },
      { from: 'api', to: 'data', label: 'Insights aggregation' },
    ],
    confirmationNote: 'Simplified overview based on the project stack.',
  },
  stack: [
    'React',
    'TypeScript',
    'Vite',
    'Tailwind CSS',
    'Framer Motion',
    'Recharts',
    'FastAPI',
    'Scikit-learn',
    'Pandas',
    'Docker',
  ],
  links: {
    github: {
      label: 'Source Code',
      url: 'https://github.com/chandrashekhar235/mind_scroll_ai',
      isTodo: false,
    },
    live: {
      label: 'Live Platform',
      url: 'https://mindscrollai-gamma.vercel.app',
      isTodo: false,
    },
  },
},
  {
    id: 'foundrai',
    title: 'FoundrAI',
    subtitle: 'AI-Powered Startup Analysis & Validation Platform',
    timeline: '2026',
    role: 'Full Stack & ML Developer',
    featured: true,
    whatIBuilt: [
      'Built B2B/B2C startup classification using TF-IDF and Logistic Regression.',
      'Implemented similarity-based knowledge retrieval from structured startup and market datasets.',
      'Integrated a Python AI engine with Node.js/Express through JSON-based inter-process communication.',
      'Secured authentication using JWT, bcrypt, PostgreSQL/Prisma, and Google OAuth.',
    ],
    architectureOverview: {
      label: 'Simplified Overview',
      draft: true,
      nodes: [
        { id: 'client', label: 'Next.js Client', sub: 'TypeScript dashboard' },
        { id: 'api', label: 'Express API', sub: 'JWT + Google OAuth' },
        { id: 'ai', label: 'Python AI Engine', sub: 'TF-IDF + Logistic Regression' },
        { id: 'db', label: 'Database', sub: 'PostgreSQL + Prisma' },
      ],
      connections: [
        { from: 'client', to: 'api', label: 'API requests' },
        { from: 'api', to: 'ai', label: 'JSON IPC' },
        { from: 'ai', to: 'api', label: 'Insights' },
        { from: 'api', to: 'db', label: 'Persist state' },
      ],
      confirmationNote: 'Simplified overview based on the project stack.',
    },
    stack: ['Next.js', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Python', 'Machine Learning'],
    links: {
      github: {
        label: 'Source Code',
        url: 'https://github.com/chandrashekhar235/foundrai',
        isTodo: false,
      },
      live: {
        label: 'Live Platform',
        url: 'https://foundrai-indol.vercel.app/',
        isTodo: false,
      },
    },
  },
]

export const projects = PROJECTS

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Full Stack Innovation & Production Applications',
    company: 'Personal & Open Source Projects',
    period: '2025 – Present',
    location: 'Self-directed',
    bullets: [
      'Architected and deployed production-grade applications like Learn Bridge and WriteSpace.',
      'Integrated real-time WebRTC audio streams, reactive state management in React, and scalable REST backends in Node.js and MongoDB.',
    ],
  },
  {
    role: 'Core Engineering, Data Structures & Algorithms',
    company: 'Continuous Learning & Engineering Rigor',
    period: '2024 – 2025',
    location: 'Self-directed',
    bullets: [
      'Deepened computer science foundations with C++ and Java.',
      'Solved algorithmic challenges focused on time/space complexity, graphs, trees, dynamic programming, and OOP patterns.',
    ],
  },
  {
    role: 'Frontend Foundations & Modern Web Technologies',
    company: 'Developer Exploration',
    period: '2023 – 2024',
    location: 'Self-directed',
    bullets: [
      'Mastered modern JavaScript (ES6+), responsive design with Flexbox/Grid, asynchronous programming, and Git workflows.',
    ],
  },
]

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: 'Frontend',
    skills: ['React', 'Next.js', 'JavaScript (ES6+)', 'TypeScript', 'HTML5 & CSS3', 'Responsive Design'],
  },
  {
    category: 'Backend & Real-Time',
    skills: ['Node.js', 'Express.js', 'RESTful APIs', 'WebRTC', 'Socket.io', 'JWT & OAuth'],
  },
  {
    category: 'Databases',
    skills: ['MongoDB & Mongoose', 'PostgreSQL', 'Prisma'],
  },
  {
    category: 'Languages & Fundamentals',
    skills: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'OOP'],
  },
  {
    category: 'Tools & Design',
    skills: ['Git & GitHub', 'Vite & Vercel', 'Postman', 'UI/UX & Figma'],
  },
]

export const CERTIFICATIONS: Certification[] = []

export const LEADERSHIP_EXPERIENCE: ExperienceItem[] = []
