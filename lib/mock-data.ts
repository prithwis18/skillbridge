// Central mock data source for the Skillora prototype.
// Shaped to mirror likely API responses so screens can swap to real
// endpoints later without structural changes.
//
// AI (Gemini) is intended to power qualitative reasoning — assessment,
// skill extraction, explanations. All quantitative values below (readiness,
// gaps, coverage) are produced by the deterministic engine in
// `lib/skill-engine.ts`, never by a model.

export type SkillStatus = "mastered" | "in-progress" | "gap"

export type Skill = {
  name: string
  status: SkillStatus
  // 0-100 proficiency the user currently has
  proficiency: number
  // 0-100 proficiency the target role expects
  required: number
  category: string
}

export type Role = {
  id: string
  title: string
  demand: "High" | "Medium" | "Low"
}

export type Course = {
  id: string
  title: string
  provider: string
  skill: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  progress: number // 0-100
  rating: number
}

export type Job = {
  id: string
  title: string
  company: string
  location: string
  type: "Full-time" | "Internship" | "Contract"
  salary: string
  posted: string
  readiness: number // 0-100 match for the current user
  matchedSkills: string[]
  missingSkills: string[]
  tags: string[]
}

export type Activity = {
  id: string
  label: string
  detail: string
  time: string
  type: "course" | "assessment" | "job" | "skill"
}

export type RoadmapPhase = {
  id: string
  title: string
  status: "completed" | "active" | "upcoming"
  duration: string
  description: string
  skills: string[]
  courses: string[]
}

export const targetRoles: Role[] = [
  { id: "backend", title: "Backend Engineer", demand: "High" },
  { id: "frontend", title: "Frontend Developer", demand: "High" },
  { id: "fullstack", title: "Full Stack Developer", demand: "High" },
  { id: "data-analyst", title: "Data Analyst", demand: "Medium" },
  { id: "data-scientist", title: "Data Scientist", demand: "High" },
  { id: "devops", title: "DevOps Engineer", demand: "Medium" },
  { id: "security", title: "Cybersecurity Engineer", demand: "Medium" },
]

export const experienceLevels = ["Beginner", "Intermediate", "Advanced"] as const

export const allSkills = [
  "C++",
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "DSA",
  "SQL",
  "Git",
  "React",
  "Node.js",
  "REST APIs",
  "Docker",
  "AWS",
  "Linux",
  "MongoDB",
  "PostgreSQL",
]

export const user = {
  name: "Aarav Sharma",
  initials: "AS",
  email: "aarav.sharma@demo.skillora.in",
  targetRole: "Backend Engineer",
  experience: "Intermediate",
  jobReadiness: 78,
  skillsMastered: 8,
  skillsRequired: 11,
  skillGaps: 2,
  recommendedJobs: 14,
  learningProgress: 42,
}

// Default profile used for the always-on demo environment (no login required).
export const demoProfile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@demo.skillora.in",
  userType: "student" as const,
  targetRole: "Backend Engineer",
  skills: [
    "Python",
    "SQL",
    "Git",
    "DSA",
    "REST APIs",
    "Linux",
    "Java",
    "PostgreSQL",
  ],
  isDemo: true,
  onboarded: true,
}

export const skills: Skill[] = [
  { name: "Python", status: "mastered", proficiency: 90, required: 80, category: "Languages" },
  { name: "SQL", status: "mastered", proficiency: 85, required: 80, category: "Databases" },
  { name: "Git", status: "mastered", proficiency: 88, required: 70, category: "Tooling" },
  { name: "DSA", status: "mastered", proficiency: 82, required: 80, category: "Fundamentals" },
  { name: "REST APIs", status: "mastered", proficiency: 78, required: 75, category: "Backend" },
  { name: "Linux", status: "mastered", proficiency: 80, required: 70, category: "Systems" },
  { name: "Java", status: "mastered", proficiency: 75, required: 65, category: "Languages" },
  { name: "PostgreSQL", status: "mastered", proficiency: 72, required: 70, category: "Databases" },
  { name: "MongoDB", status: "mastered", proficiency: 70, required: 65, category: "Databases" },
  { name: "Node.js", status: "in-progress", proficiency: 55, required: 80, category: "Backend" },
  { name: "Docker", status: "in-progress", proficiency: 45, required: 75, category: "DevOps" },
  { name: "AWS", status: "gap", proficiency: 20, required: 75, category: "Cloud" },
  { name: "System Design", status: "gap", proficiency: 15, required: 80, category: "Architecture" },
  { name: "Kubernetes", status: "gap", proficiency: 5, required: 65, category: "DevOps" },
  { name: "Redis", status: "gap", proficiency: 10, required: 60, category: "Databases" },
]

export const courses: Course[] = [
  {
    id: "c1",
    title: "Node.js Backend Masterclass",
    provider: "SkillBridge Academy",
    skill: "Node.js",
    level: "Intermediate",
    duration: "6 weeks",
    progress: 60,
    rating: 4.7,
  },
  {
    id: "c2",
    title: "Docker & Containers in Practice",
    provider: "CloudNative Institute",
    skill: "Docker",
    level: "Intermediate",
    duration: "4 weeks",
    progress: 35,
    rating: 4.6,
  },
  {
    id: "c3",
    title: "AWS Cloud Practitioner to Developer",
    provider: "SkillBridge Academy",
    skill: "AWS",
    level: "Beginner",
    duration: "8 weeks",
    progress: 0,
    rating: 4.8,
  },
  {
    id: "c4",
    title: "Scalable System Design",
    provider: "Backend Guild",
    skill: "System Design",
    level: "Advanced",
    duration: "10 weeks",
    progress: 0,
    rating: 4.9,
  },
  {
    id: "c5",
    title: "Kubernetes Fundamentals",
    provider: "CloudNative Institute",
    skill: "Kubernetes",
    level: "Beginner",
    duration: "5 weeks",
    progress: 0,
    rating: 4.5,
  },
  {
    id: "c6",
    title: "Caching with Redis",
    provider: "Backend Guild",
    skill: "Redis",
    level: "Intermediate",
    duration: "3 weeks",
    progress: 0,
    rating: 4.4,
  },
]

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Backend Engineer",
    company: "Infosys",
    location: "Bengaluru, KA",
    type: "Full-time",
    salary: "₹12–18 LPA",
    posted: "2 days ago",
    readiness: 78,
    matchedSkills: ["Python", "SQL", "REST APIs", "PostgreSQL", "Git"],
    missingSkills: ["AWS", "System Design"],
    tags: ["Microservices", "PostgreSQL", "REST"],
  },
  {
    id: "j2",
    title: "Software Engineer — Backend",
    company: "Zoho",
    location: "Chennai, TN",
    type: "Full-time",
    salary: "₹10–15 LPA",
    posted: "4 days ago",
    readiness: 71,
    matchedSkills: ["Java", "SQL", "DSA", "Git"],
    missingSkills: ["Docker", "AWS"],
    tags: ["Java", "Distributed Systems"],
  },
  {
    id: "j3",
    title: "Platform Engineer",
    company: "Freshworks",
    location: "Remote, India",
    type: "Full-time",
    salary: "₹14–20 LPA",
    posted: "1 week ago",
    readiness: 58,
    matchedSkills: ["Python", "Linux", "REST APIs"],
    missingSkills: ["Docker", "Kubernetes", "AWS"],
    tags: ["Cloud", "Kubernetes", "CI/CD"],
  },
  {
    id: "j4",
    title: "Backend Developer Intern",
    company: "Razorpay",
    location: "Bengaluru, KA",
    type: "Internship",
    salary: "₹40k/month",
    posted: "3 days ago",
    readiness: 84,
    matchedSkills: ["Python", "SQL", "REST APIs", "Git", "MongoDB"],
    missingSkills: ["Docker"],
    tags: ["Payments", "Node.js", "MongoDB"],
  },
  {
    id: "j5",
    title: "API Engineer",
    company: "Postman",
    location: "Hyderabad, TS",
    type: "Full-time",
    salary: "₹16–22 LPA",
    posted: "5 days ago",
    readiness: 64,
    matchedSkills: ["REST APIs", "Node.js", "Git"],
    missingSkills: ["AWS", "System Design"],
    tags: ["API", "Node.js", "Cloud"],
  },
]

export const activities: Activity[] = [
  {
    id: "a1",
    label: "Completed lesson",
    detail: "Async Patterns in Node.js Backend Masterclass",
    time: "2 hours ago",
    type: "course",
  },
  {
    id: "a2",
    label: "New job match",
    detail: "Backend Developer Intern at Razorpay — 84% ready",
    time: "1 day ago",
    type: "job",
  },
  {
    id: "a3",
    label: "Skill improved",
    detail: "Docker proficiency increased to 45%",
    time: "2 days ago",
    type: "skill",
  },
  {
    id: "a4",
    label: "Assessment updated",
    detail: "Re-ran skill gap analysis for Backend Engineer",
    time: "3 days ago",
    type: "assessment",
  },
  {
    id: "a5",
    label: "Skill mastered",
    detail: "PostgreSQL marked as mastered",
    time: "5 days ago",
    type: "skill",
  },
]

export const roadmap: RoadmapPhase[] = [
  {
    id: "p1",
    title: "Foundations Consolidated",
    status: "completed",
    duration: "Weeks 1–3",
    description:
      "Core backend fundamentals, data structures, and relational databases are solid and verified.",
    skills: ["Python", "SQL", "DSA", "REST APIs"],
    courses: ["Backend Fundamentals", "SQL Deep Dive"],
  },
  {
    id: "p2",
    title: "Server-Side Depth",
    status: "active",
    duration: "Weeks 4–7",
    description:
      "Build production-grade services with Node.js and containerize them with Docker.",
    skills: ["Node.js", "Docker"],
    courses: ["Node.js Backend Masterclass", "Docker & Containers in Practice"],
  },
  {
    id: "p3",
    title: "Cloud & Scale",
    status: "upcoming",
    duration: "Weeks 8–12",
    description:
      "Deploy to AWS, learn scalable system design, and add caching with Redis.",
    skills: ["AWS", "System Design", "Redis"],
    courses: ["AWS Cloud Practitioner to Developer", "Scalable System Design"],
  },
  {
    id: "p4",
    title: "Orchestration & Job Readiness",
    status: "upcoming",
    duration: "Weeks 13–16",
    description:
      "Master Kubernetes, complete mock interviews, and reach full readiness for target roles.",
    skills: ["Kubernetes"],
    courses: ["Kubernetes Fundamentals", "Backend Interview Prep"],
  },
]

// Job-specific readiness breakdown (used on the Job Readiness screen).
export const readinessTarget = jobs[0]

export const readinessBreakdown = {
  overall: readinessTarget.readiness,
  categories: [
    { name: "Technical Skills", score: 82, weight: "40%" },
    { name: "Tooling & DevOps", score: 48, weight: "25%" },
    { name: "System Design", score: 40, weight: "20%" },
    { name: "Fundamentals (DSA)", score: 88, weight: "15%" },
  ],
  strengths: ["Python", "SQL", "REST APIs", "PostgreSQL", "DSA", "Git"],
  toImprove: ["AWS", "System Design", "Docker"],
  recommendation:
    "You are strongly aligned on core backend skills. Close the AWS and System Design gaps to move from 78% to interview-ready (90%+).",
}

// ---------------------------------------------------------------------------
// Skill Intelligence: role requirements + category coverage
// ---------------------------------------------------------------------------

export type SkillCategory =
  | "Programming"
  | "Backend Development"
  | "Databases"
  | "DevOps"
  | "System Design"
  | "CS Fundamentals"

export type RequiredSkill = {
  name: string
  category: SkillCategory
  required: number // 0-5 level the target role expects
}

// Target role requirement matrix (Backend Engineer demo).
// Levels are 0-5 to match how requirements are usually expressed in role rubrics.
export const roleRequirements: RequiredSkill[] = [
  { name: "Python", category: "Programming", required: 4 },
  { name: "Java", category: "Programming", required: 3 },
  { name: "DSA", category: "CS Fundamentals", required: 4 },
  { name: "Computer Networks", category: "CS Fundamentals", required: 3 },
  { name: "REST APIs", category: "Backend Development", required: 4 },
  { name: "Node.js", category: "Backend Development", required: 3 },
  { name: "SQL", category: "Databases", required: 4 },
  { name: "PostgreSQL", category: "Databases", required: 3 },
  { name: "Redis", category: "Databases", required: 3 },
  { name: "Docker", category: "DevOps", required: 4 },
  { name: "AWS", category: "DevOps", required: 4 },
  { name: "System Design", category: "System Design", required: 4 },
]

// Current, assessment-derived levels for the demo user (0-5).
export const userSkillLevels: Record<string, number> = {
  Python: 4,
  Java: 3,
  DSA: 4,
  "Computer Networks": 2,
  "REST APIs": 4,
  "Node.js": 2,
  SQL: 4,
  PostgreSQL: 3,
  Redis: 1,
  Docker: 2,
  AWS: 1,
  "System Design": 1,
  Git: 4,
  Linux: 4,
}

export type PriorityGap = {
  rank: number
  skill: string
  currentLevel: number
  requiredLevel: number
  priority: "High" | "Medium" | "Low"
  reason: string
}

export const priorityGaps: PriorityGap[] = [
  {
    rank: 1,
    skill: "AWS",
    currentLevel: 1,
    requiredLevel: 4,
    priority: "High",
    reason: "Required by 7 of your target jobs",
  },
  {
    rank: 2,
    skill: "System Design",
    currentLevel: 1,
    requiredLevel: 4,
    priority: "High",
    reason: "Frequently required for backend engineering roles",
  },
  {
    rank: 3,
    skill: "Docker",
    currentLevel: 2,
    requiredLevel: 4,
    priority: "Medium",
    reason: "Expected for containerized deployment workflows",
  },
  {
    rank: 4,
    skill: "Redis",
    currentLevel: 1,
    requiredLevel: 3,
    priority: "Low",
    reason: "Useful for caching-heavy services",
  },
]

// AI-authored qualitative insight (Why / What / Next). Deterministic values
// are injected by the engine, the narrative framing is the AI's contribution.
export const aiInsight = {
  headline:
    "Your strongest foundation is in programming fundamentals and databases.",
  why: "You demonstrate consistent, verified strength across Python, SQL, PostgreSQL and data structures — the core of backend engineering.",
  what: "Your biggest employability gap is deployment and cloud infrastructure: AWS and Docker sit well below role requirements, and System Design is untested.",
  next: "Closing AWS + Docker could unlock additional matching roles and move you from 78% to interview-ready.",
}

export type LearningStep = {
  order: number
  title: string
  closes: string
  hours: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  impact: "High" | "Medium" | "Low"
  readinessGain: number
}

// Learning path derived from the priority gaps (highest impact first).
export const learningPath: LearningStep[] = [
  {
    order: 1,
    title: "Docker Fundamentals",
    closes: "Docker",
    hours: 3,
    difficulty: "Beginner",
    impact: "High",
    readinessGain: 5,
  },
  {
    order: 2,
    title: "AWS Essentials for Developers",
    closes: "AWS",
    hours: 6,
    difficulty: "Intermediate",
    impact: "High",
    readinessGain: 8,
  },
  {
    order: 3,
    title: "Scalable System Design",
    closes: "System Design",
    hours: 8,
    difficulty: "Advanced",
    impact: "Medium",
    readinessGain: 6,
  },
]

export type JourneyStage = {
  label: string
  status: "done" | "current" | "upcoming"
  future?: boolean
}

export const employmentJourney: JourneyStage[] = [
  { label: "Assessment", status: "done" },
  { label: "Learning", status: "done" },
  { label: "Skills Improved", status: "done" },
  { label: "Job Matched", status: "current" },
  { label: "Application", status: "upcoming", future: true },
  { label: "Interview", status: "upcoming", future: true },
  { label: "Placed", status: "upcoming", future: true },
]
