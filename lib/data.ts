export const personalDetails = {
  name: 'Marcus Forsberg',
  roles: ['Developer', 'QA', 'Guide'],
  status: 'Still under development',
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
    items: ['React', 'Next.js', 'Node.js', 'Javalin', 'JPA/Hibernate', 'JUnit'],
  },
  {
    category: 'Data & ML',
    icon: '📊',
    items: ['Scikit-learn', 'Pandas', 'Jupyter', 'PostgreSQL', 'MySQL'],
  },
  {
    category: 'Tools & Platforms',
    icon: '✦',
    items: ['Git', 'Docker', 'Tailwind CSS', 'Figma', 'Vercel', 'REST APIs'],
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
  desc: string;
  tags: string[];
  color: string;
  link?: string;
  hidden: boolean;
};

export const classes: ClassItem[] = [
  {
    title: 'Course 1',
    subtitle: 'Creation of the portfolio website',
    desc: 'I denne uge, lavede jeg min portfolio hjemmeside, som du ser lige nu. Jeg brugte Next.js og Tailwind CSS til at lave den.',
    tags: ['Next.js', 'Tailwind CSS', 'Portfolio', 'Vercel'],
    color: 'from-blue-400/20 to-purple-400/20',
    hidden: false,
  },
  {
    title: 'Course 2',
    subtitle: 'RAG chatbot',
    desc: 'I denne uge har jeg smidt en RAG-chatbot (Retrieval-Augmented Generation) på siden, så den ikke bare står og gætter. Rent teknisk har jeg oversat hele mit CV til matematiske vektorer og lagt det i en Supabase-database. Når du stiller et spørgsmål, bliver det også lavet om til en vektor. Så sammenligner mit API de to vektorer for at finde de steder i mit CV, der bedst matcher det du spørger om. Til sidst ryger teksten over i Llama-3, som bruger den til at stykke et fornuftigt svar sammen.',
    tags: ['RAG', 'Vector Search', 'Supabase'],
    color: 'from-green-400/20 to-emerald-400/20',
    hidden: false,
  },
  {
    title: 'Course 3',
    subtitle: 'Meditations-quiz',
    desc: 'Interaktiv quiz i 5 sektioner med 29 spørgsmål om meditation — stilhed, afspændthed, opmærksomhed og at lade alting være. Vælg svar, aflever, og få facit med markering af rigtigt/forkert.',
    tags: ['Quiz', 'React', 'State'],
    color: 'from-amber-400/20 to-orange-400/20',
    link: '/llm/course3',
    hidden: false,
  },
  // Add more weeks here as the course progresses
];
