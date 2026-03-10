import { Job, User, PersonalityTraits, ExtractedSkill, ExtractedExperience, ExtractedEducation } from '@/types';

export const mockUsers: User[] = [
  { id: '1', username: 'john_candidate', role: 'candidate', email: 'john@example.com' },
  { id: '2', username: 'sarah_recruiter', role: 'recruiter', email: 'sarah@company.com' },
];

const generatePersonalityTraits = (): PersonalityTraits => ({
  openness: Math.floor(Math.random() * 30) + 60,
  conscientiousness: Math.floor(Math.random() * 30) + 60,
  extraversion: Math.floor(Math.random() * 40) + 50,
  agreeableness: Math.floor(Math.random() * 30) + 60,
  neuroticism: Math.floor(Math.random() * 40) + 20,
});

const generateExtractedSkills = (): ExtractedSkill[] => [
  { name: 'Python', relevance: 95, category: 'technical' },
  { name: 'Machine Learning', relevance: 90, category: 'technical' },
  { name: 'SQL', relevance: 85, category: 'technical' },
  { name: 'TensorFlow', relevance: 80, category: 'technical' },
  { name: 'Communication', relevance: 75, category: 'soft' },
  { name: 'Problem Solving', relevance: 88, category: 'soft' },
  { name: 'Data Analysis', relevance: 92, category: 'domain' },
];

const generateExtractedExperience = (): ExtractedExperience[] => [
  {
    company: 'Tech Solutions Inc.',
    role: 'ML Engineer',
    duration: '2 years',
    highlights: ['Built recommendation engine', 'Improved model accuracy by 25%']
  },
  {
    company: 'DataCorp',
    role: 'Data Analyst',
    duration: '1.5 years',
    highlights: ['Analyzed customer behavior', 'Created dashboards']
  }
];

const generateExtractedEducation = (): ExtractedEducation[] => [
  {
    institution: 'Stanford University',
    degree: 'M.S.',
    field: 'Computer Science',
    year: '2022'
  },
  {
    institution: 'UC Berkeley',
    degree: 'B.S.',
    field: 'Data Science',
    year: '2020'
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'AI Engineer',
    company: 'TechCorp AI',
    description: 'Work on machine learning models, NLP pipelines, and AI-driven applications. You will be responsible for developing cutting-edge AI solutions.',
    deadline: '2026-02-15',
    questions: [
      'Describe a challenging ML project you worked on.',
      'How do you evaluate model performance?',
      'How do you handle noisy or incomplete data?'
    ],
    weights: { resume: 50, behaviour: 20 },
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'Deep Learning'],
    applicants: [
      {
        id: 'a1',
        name: 'Alice Johnson',
        userId: 'u3',
        appliedAt: '2026-01-02 10:30',
        resumeName: 'alice_resume.pdf',
        resumeURL: '#',
        resumeScore: 88,
        behaviourScore: 82,
        fitScore: 85,
        resumeInsights: 'Strong ML background, excellent Python skills, published research',
        behaviourInsights: 'Shows leadership qualities, clear communication',
        status: 'Under Review',
        locked: false,
        behaviouralAnswers: ['Built a recommendation system...', 'Use F1 score...', 'Data imputation...'],
        personalityTraits: generatePersonalityTraits(),
        extractedSkills: generateExtractedSkills(),
        extractedExperience: generateExtractedExperience(),
        extractedEducation: generateExtractedEducation(),
        matchExplanation: 'Strong match due to ML expertise and relevant project experience in NLP systems.'
      },
      {
        id: 'a2',
        name: 'Bob Smith',
        userId: 'u4',
        appliedAt: '2026-01-03 14:15',
        resumeName: 'bob_cv.docx',
        resumeURL: '#',
        resumeScore: 72,
        behaviourScore: 78,
        fitScore: 75,
        resumeInsights: 'Good technical skills, needs more deployment experience',
        behaviourInsights: 'Team player, adaptable to change',
        status: 'Under Review',
        locked: false,
        behaviouralAnswers: ['Worked on image classification...', 'Cross-validation...', 'Feature engineering...'],
        personalityTraits: generatePersonalityTraits(),
        extractedSkills: [
          { name: 'Python', relevance: 80, category: 'technical' },
          { name: 'Deep Learning', relevance: 70, category: 'technical' },
          { name: 'SQL', relevance: 65, category: 'technical' },
        ],
        extractedExperience: [
          { company: 'StartupAI', role: 'Junior ML Developer', duration: '1 year', highlights: ['Image classification'] }
        ],
        extractedEducation: [
          { institution: 'MIT', degree: 'B.S.', field: 'Computer Science', year: '2023' }
        ],
        matchExplanation: 'Good foundational skills but lacks production experience mentioned in job requirements.'
      }
    ],
    createdAt: '2026-01-01',
    createdBy: '2'
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    description: 'Build and maintain web applications using React, Node.js, and PostgreSQL. Work in an agile environment with cross-functional teams.',
    deadline: '2026-02-28',
    questions: [
      'What is your approach to writing clean, maintainable code?',
      'Describe a time you had to learn a new technology quickly.',
      'How do you handle disagreements with team members?'
    ],
    weights: { resume: 40, behaviour: 30 },
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs'],
    applicants: [],
    createdAt: '2026-01-02',
    createdBy: '2'
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    description: 'Analyze large datasets to derive actionable insights. Build predictive models and create data visualizations for stakeholders.',
    deadline: '2026-03-10',
    questions: [
      'Walk us through your data analysis workflow.',
      'How do you communicate complex findings to non-technical stakeholders?',
      'Describe a time when your analysis led to a significant business decision.'
    ],
    weights: { resume: 45, behaviour: 25 },
    requiredSkills: ['Python', 'R', 'SQL', 'Tableau', 'Statistics', 'Machine Learning'],
    applicants: [
      {
        id: 'a3',
        name: 'Charlie Davis',
        userId: 'u5',
        appliedAt: '2026-01-04 09:00',
        resumeName: 'charlie_resume.pdf',
        resumeURL: '#',
        resumeScore: 91,
        behaviourScore: 85,
        fitScore: 88,
        resumeInsights: 'PhD in Statistics, extensive industry experience',
        behaviourInsights: 'Excellent presentation skills, strategic thinker',
        status: 'Shortlisted',
        locked: true,
        behaviouralAnswers: ['Start with EDA...', 'Use storytelling...', 'Identified customer churn...'],
        personalityTraits: { openness: 85, conscientiousness: 90, extraversion: 70, agreeableness: 80, neuroticism: 30 },
        extractedSkills: [
          { name: 'Python', relevance: 95, category: 'technical' },
          { name: 'R', relevance: 90, category: 'technical' },
          { name: 'Statistics', relevance: 95, category: 'domain' },
          { name: 'Tableau', relevance: 85, category: 'technical' },
        ],
        extractedExperience: [
          { company: 'Big Data Inc.', role: 'Senior Data Scientist', duration: '4 years', highlights: ['Led analytics team', 'Reduced churn by 15%'] }
        ],
        extractedEducation: [
          { institution: 'Harvard', degree: 'Ph.D.', field: 'Statistics', year: '2019' }
        ],
        matchExplanation: 'Exceptional match with PhD credentials and proven industry impact in data science.'
      }
    ],
    createdAt: '2026-01-03',
    createdBy: '2'
  }
];

export const generateResumeAnalysis = () => ({
  matchScore: Math.floor(Math.random() * 20) + 75,
  strengths: [
    'Strong technical skills in required technologies',
    'Relevant project experience',
    'Good educational background'
  ],
  improvements: [
    'Add more quantifiable achievements',
    'Include deployment experience',
    'Highlight leadership roles'
  ],
  skills: ['Python', 'Machine Learning', 'SQL', 'React', 'Node.js'],
  experience: '3+ years',
  education: 'B.S. Computer Science',
  extractedEntities: {
    skills: generateExtractedSkills(),
    experience: generateExtractedExperience(),
    education: generateExtractedEducation()
  },
  matchExplanation: 'Your resume shows strong alignment with the technical requirements. Key strengths include relevant programming skills and project experience.'
});

export const generateBehaviouralScores = () => ({
  score: Math.floor(Math.random() * 15) + 75,
  insights: [
    'Clear and structured responses',
    'Shows problem-solving mindset',
    'Demonstrates teamwork abilities'
  ].join(', ')
});

export const generatePersonalityAnalysis = (): PersonalityTraits => generatePersonalityTraits();

export const calculateFitScore = (resumeScore: number, behaviourScore: number, resumeWeight: number, behaviourWeight: number): number => {
  const totalWeight = resumeWeight + behaviourWeight;
  return Math.round((resumeScore * resumeWeight + behaviourScore * behaviourWeight) / totalWeight);
};
