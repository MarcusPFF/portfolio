export const personalDetails = {
  name: 'Marcus Forsberg',
  roles: [
    'a Property Onboarding Specialist',
    'a Fullstack Developer',
    'doing Software Quality Assurance',
    'an Adventurer',
  ],
  status: 'Welcome to my personal site. Here you will find projects, my motorcycle trips and information about me.',
  stats: [
    { value: '3+', label: 'Years Experience' },
    { value: '10+', label: 'Projects Built' },
    { value: '14k+', label: 'Km Ridden' },
  ],
};

export const skillGroups = [
  {
    category: 'Languages',
    icon: '{ }',
    items: ['Java', 'TypeScript', 'JavaScript', 'Python', 'HTML/CSS', 'SQL'],
  },
  {
    category: 'Frameworks & Libraries',
    icon: '⚡',
    items: [
      'React',
      'Next.js',
      'Node.js',
      'Javalin',
      'JPA/Hibernate',
      'JUnit',
      'JWT',
      'Three.js',
      'Tailwind CSS',
      'Streamlit',
    ],
  },
  {
    category: 'Data & ML',
    icon: '📊',
    items: [
      'Scikit-learn',
      'Pandas',
      'Jupyter',
      'PostgreSQL',
      'MySQL',
      'Supabase',
      'RAG',
    ],
  },
  {
    category: 'Tools & Platforms',
    icon: '✦',
    items: [
      'Git',
      'GitHub Actions',
      'Maven',
      'Docker',
      'Vercel',
      'Cloudflare',
      'Groq',
      'Resend',
      'Figma',
      'REST APIs',
    ],
  },
];

type Project = {
  title: string;
  subtitle: string;
  desc: string;
  tags: string[];
  link?: string;
  hidden: boolean;
  pinLast?: boolean;
};

const projectList: Project[] = [
  {
    title: 'Atlas',
    subtitle: 'Coming soon',
    desc: 'A logbook for adventure rides.',
    tags: ['Adventure', 'Logbook', 'Maps'],
    hidden: false,
  },
  {
    title: 'More on github',
    subtitle: 'All repositories',
    desc: 'Everything I\'ve built and shared publicly.',
    tags: ['Java', 'Python', 'JavaScript'],
    link: 'https://github.com/MarcusPFF',
    hidden: false,
    pinLast: true,
  },
];

// "More on github" is the catch-all link, so it always sorts to the end.
// (Stable sort keeps the other projects in the order written above.)
export const projects: Project[] = projectList.sort(
  (a, b) => (a.pinLast ? 1 : 0) - (b.pinLast ? 1 : 0),
);

type ClassItem = {
  title: string;
  subtitle: string;
  tags: string[];
  link?: string;
  blogSlug?: string;
  hidden: boolean;
};

export const classes: ClassItem[] = [
  {
    title: 'Course 1',
    subtitle: 'Creation of the portfolio website',
    tags: ['Next.js', 'Tailwind CSS', 'Portfolio', 'Vercel'],
    blogSlug: 'course1',
    hidden: false,
  },
  {
    title: 'Course 2 + 3',
    subtitle: 'RAG chatbot',
    tags: ['RAG', 'Vector Search', 'Supabase'],
    blogSlug: 'course2',
    hidden: false,
  },
  {
    title: 'Course 4',
    subtitle: 'Kodeagenter',
    tags: ['Code Agents', 'Claude Code', 'Quiz', 'React'],
    link: '/llm/course3',
    blogSlug: 'course4',
    hidden: false,
  },
  {
    title: 'Course 5 + 6',
    subtitle: 'LLM API Integration',
    tags: ['Groq', 'Llama 3.3', 'API', 'Server-side'],
    link: '/llm/course-5',
    blogSlug: 'course5',
    hidden: false,
  },
  {
    title: 'Course 7',
    subtitle: 'Spec Driven Development',
    tags: ['Specs', 'Ethics', 'GDPR', 'Reflection'],
    blogSlug: 'course7',
    hidden: false,
  },
  {
    title: 'Course 8 + 9',
    subtitle: 'Virksomhedsoplæg + Projektstart',
    tags: ['E.G.', 'Project', 'AI App'],
    blogSlug: 'course8',
    hidden: false,
  },
  {
    title: 'Course 10 + 11',
    subtitle: 'Idéløsning til E.G.',
    tags: ['E.G.', 'MVP', 'Next.js', 'Supabase'],
    link: '/llm/course10',
    blogSlug: 'course10',
    hidden: false,
  },
  // Add more weeks here as the course progresses
];
