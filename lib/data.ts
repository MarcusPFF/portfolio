export const personalDetails = {
  name: 'Marcus Forsberg',
  roles: ['Fullstack Developer', 'QA', 'Guide'],
  status: 'Welcome to my personal site. Here you will find projects, my motorcycle trips and information about me.',
  stats: [
    { value: '3+', label: 'Years Experience' },
    { value: '10+', label: 'Projects Built' },
    { value: '∞', label: 'White monsters' },
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

export const projects = [
  {
    title: 'Football ML Exam',
    subtitle: 'Machine Learning',
    desc: 'Predicting football match outcomes using ML models for regression, clustering, and classification.',
    tags: ['Python', 'Jupyter', 'Scikit-learn'],
    color: 'from-green-400/20 to-emerald-400/20',
    link: 'https://github.com/MarcusPFF/Football_MachineLearning_exam',
    hidden: false,
  },
  {
    title: 'Carport Fog',
    subtitle: 'Full-Stack Web App',
    desc: 'E-commerce platform for custom carport orders with SVG blueprint generation and admin dashboard.',
    tags: ['Java', 'MySQL', 'JSP', 'CSS'],
    color: 'from-amber-400/20 to-orange-400/20',
    link: 'https://github.com/MarcusPFF/Carport-Fog',
    hidden: false,
  },
  {
    title: 'Calculator',
    subtitle: 'Full-Stack App',
    desc: 'Full-stack calculator with a Java REST API backend and a JavaScript frontend consuming it.',
    tags: ['Java', 'JavaScript', 'REST API', 'HTML/CSS'],
    color: 'from-blue-400/20 to-purple-400/20',
    link: 'https://github.com/MarcusPFF/calcAPI',
    hidden: false,
  },
  {
    title: 'Car Price Predictor',
    subtitle: 'Data Science',
    desc: 'ML pipeline predicting used car prices using regression, clustering, and classification models.',
    tags: ['Python', 'Jupyter', 'Pandas'],
    color: 'from-pink-400/20 to-rose-400/20',
    link: 'https://github.com/MarcusPFF/car-price-prediction-machine-learning',
    hidden: false,
  },
  {
    title: 'Exam Fall API',
    subtitle: 'Backend API',
    desc: 'RESTful API with JWT authentication, role-based access control, and full CRUD operations.',
    tags: ['Java', 'Javalin', 'JPA', 'PostgreSQL'],
    color: 'from-violet-400/20 to-indigo-400/20',
    link: 'https://github.com/MarcusPFF/Exam_fallE24_API',
    hidden: false,
  },
  {
    title: 'Movie Repository',
    subtitle: 'API Integration',
    desc: 'Fetches movie data from an external API and persists it into a local database using JPA.',
    tags: ['Java', 'JPA', 'REST API', 'PostgreSQL'],
    color: 'from-teal-400/20 to-cyan-400/20',
    link: 'https://github.com/MarcusPFF/sp1_movierepository',
    hidden: false,
  },
  {
    title: 'Streaming Service',
    subtitle: 'Terminal App',
    desc: 'Local streaming service with terminal-based navigation for browsing movies and series.',
    tags: ['Java', 'OOP', 'File I/O'],
    color: 'from-red-400/20 to-orange-400/20',
    link: 'https://github.com/MarcusPFF/SP3-StreamingServiceProject',
    hidden: false,
  },
  {
    title: 'Discord On A Budget',
    subtitle: 'Networking',
    desc: 'Local chat server using TCP sockets and multithreading for real-time client communication.',
    tags: ['Java', 'TCP', 'Multithreading'],
    color: 'from-sky-400/20 to-blue-400/20',
    link: 'https://github.com/MarcusPFF/Discord-On-A-Budget',
    hidden: false,
  },
];

type ClassItem = {
  title: string;
  subtitle: string;
  desc?: string;
  tags: string[];
  color: string;
  link?: string;
  blogSlug?: string;
  hidden: boolean;
};

export const classes: ClassItem[] = [
  {
    title: 'Course 1',
    subtitle: 'Creation of the portfolio website',
    tags: ['Next.js', 'Tailwind CSS', 'Portfolio', 'Vercel'],
    color: 'from-blue-400/20 to-purple-400/20',
    blogSlug: 'course1',
    hidden: false,
  },
  {
    title: 'Course 2 + 3',
    subtitle: 'RAG chatbot',
    tags: ['RAG', 'Vector Search', 'Supabase'],
    color: 'from-green-400/20 to-emerald-400/20',
    blogSlug: 'course2',
    hidden: false,
  },
  {
    title: 'Course 4',
    subtitle: 'Meditations-quiz',
    tags: ['Quiz', 'React', 'State'],
    color: 'from-amber-400/20 to-orange-400/20',
    link: '/llm/course3',
    blogSlug: 'course4',
    hidden: false,
  },
  {
    title: 'Course 5 + 6',
    subtitle: 'LLM API Integration',
    tags: ['Groq', 'Llama 3.3', 'API', 'Server-side'],
    color: 'from-teal-400/20 to-cyan-400/20',
    link: '/llm/course-5',
    blogSlug: 'course5',
    hidden: false,
  },
  // Add more weeks here as the course progresses
];
