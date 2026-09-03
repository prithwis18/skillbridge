// Central data source for the Skillora prototype.
//
// This module doubles as a lightweight, DETERMINISTIC "Skill Intelligence
// Engine": readiness, coverage, gaps and job matches are all computed from a
// single source of truth (the assessed `skills` + role requirements) so the
// numbers are explainable and never random. When the Supabase + Gemini backend
// is wired in, screens can swap these exports for API responses of the same
// shape without structural changes. Gemini is reserved for *explanations*
// (career insight, reasoning) — never for the deterministic math below.

export type SkillStatus = "mastered" | "in-progress" | "gap"

export type SkillCategory =
  | "Programming"
  | "Backend Development"
  | "Databases"
  | "DevOps"
  | "System Design"
  | "Computer Science Fundamentals"

export type Skill = {
  name: string
  status: SkillStatus
  proficiency: number // 0-100 proficiency the user currently has
  required: number // 0-100 proficiency the target role expects
  category: SkillCategory
  // `core` skills define the target role's benchmark and drive the overall
  // readiness score. Non-core skills enrich the coverage map only.
  core?: boolean
}

export type Role = {
  id: string
  title: string
  demand: "High" | "Medium" | "Low"
}

export type UserType = "student" | "job_seeker" | "working_professional" | "other"

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
  experience: string
  posted: string
  readiness: number // computed match for the current user
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

// Impact-based learning step (drives the personalized roadmap).
export type RoadmapStep = {
  id: string
  order: number
  title: string
  closesSkill: string
  hours: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  impact: "High" | "Medium" | "Low"
  readinessGain: number // projected readiness points added
  description: string
}

// Kept for backwards compatibility with any phase-based view.
export type RoadmapPhase = {
  id: string
  title: string
  status: "completed" | "active" | "upcoming"
  duration: string
  description: string
  skills: string[]
  courses: string[]
}

export type CoverageCategory = {
  name: SkillCategory
  score: number
  matched: string[]
  missing: string[]
}

export type PriorityGap = {
  rank: number
  skill: string
  priority: "High" | "Medium" | "Low"
  reason: string
  jobsRequiring: number
  gap: number
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export const targetRoles: Role[] = [
  { id: "backend", title: "Backend Engineer", demand: "High" },
  { id: "frontend", title: "Frontend Developer", demand: "High" },
  { id: "fullstack", title: "Full Stack Developer", demand: "High" },
  { id: "data-analyst", title: "Data Analyst", demand: "Medium" },
  { id: "data-scientist", title: "Data Scientist", demand: "High" },
  { id: "devops", title: "DevOps Engineer", demand: "Medium" },
  { id: "cloud", title: "Cloud Engineer", demand: "High" },
  { id: "software", title: "Software Engineer", demand: "High" },
]

export const experienceLevels = ["Beginner", "Intermediate", "Advanced"] as const

export const userTypes: { value: UserType; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "working_professional", label: "Working Professional" },
  { value: "other", label: "Other" },
]

export const allSkills = [
  "C++",
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "DSA",
  "OOP",
  "SQL",
  "Git",
  "Linux",
  "React",
  "Node.js",
  "REST APIs",
  "Docker",
  "Kubernetes",
  "AWS",
  "System Design",
  "MongoDB",
  "PostgreSQL",
  "Redis",
]

// ---------------------------------------------------------------------------
// Assessed skills (single source of truth for the demo profile)
// ---------------------------------------------------------------------------
// 11 core skills define the Backend Engineer benchmark: 8 are mastered,
// 1 is in progress (Docker), 2 are critical gaps (AWS, System Design).

export const skills: Skill[] = [
  // Programming
  { name: "Python", status: "mastered", proficiency: 90, required: 80, category: "Programming", core: true },
  { name: "OOP", status: "mastered", proficiency: 78, required: 70, category: "Programming", core: true },
  // Computer Science Fundamentals
  { name: "DSA", status: "mastered", proficiency: 82, required: 80, category: "Computer Science Fundamentals", core: true },
  { name: "Linux", status: "mastered", proficiency: 80, required: 65, category: "Computer Science Fundamentals", core: true },
  // Databases
  { name: "SQL", status: "mastered", proficiency: 85, required: 80, category: "Databases", core: true },
  { name: "PostgreSQL", status: "mastered", proficiency: 74, required: 70, category: "Databases", core: true },
  { name: "Redis", status: "gap", proficiency: 12, required: 55, category: "Databases" },
  // Backend Development
  { name: "REST APIs", status: "mastered", proficiency: 78, required: 75, category: "Backend Development", core: true },
  { name: "Git", status: "mastered", proficiency: 88, required: 70, category: "Backend Development", core: true },
  { name: "Node.js", status: "in-progress", proficiency: 55, required: 75, category: "Backend Development" },
  // DevOps
  { name: "Docker", status: "in-progress", proficiency: 30, required: 75, category: "DevOps", core: true },
  { name: "AWS", status: "gap", proficiency: 12, required: 75, category: "DevOps", core: true },
  { name: "Kubernetes", status: "gap", proficiency: 5, required: 60, category: "DevOps" },
  // System Design
  { name: "System Design", status: "gap", proficiency: 8, required: 80, category: "System Design", core: true },
]

// ---------------------------------------------------------------------------
// Deterministic engine
// ---------------------------------------------------------------------------

/** Fraction (0-1) of a role's requirement a skill satisfies (capped at 1). */
export function skillCoverageRatio(s: Pick<Skill, "proficiency" | "required">) {
  if (s.required <= 0) return 1
  return Math.min(1, s.proficiency / s.required)
}

/** Overall readiness = weighted coverage of the role's core skills. */
export function computeOverallReadiness(list: Skill[] = skills): number {
  const core = list.filter((s) => s.core)
  if (core.length === 0) return 0
  const sumMin = core.reduce((acc, s) => acc + Math.min(s.proficiency, s.required), 0)
  const sumReq = core.reduce((acc, s) => acc + s.required, 0)
  return Math.round((sumMin / sumReq) * 100)
}

const CATEGORIES: SkillCategory[] = [
  "Programming",
  "Backend Development",
  "Databases",
  "DevOps",
  "System Design",
  "Computer Science Fundamentals",
]

/** Per-category coverage with matched / missing skill lists. */
export function computeCoverage(list: Skill[] = skills): CoverageCategory[] {
  return CATEGORIES.map((name) => {
    const inCat = list.filter((s) => s.category === name)
    const score =
      inCat.length === 0
        ? 0
        : Math.round(
            (inCat.reduce((acc, s) => acc + skillCoverageRatio(s), 0) / inCat.length) * 100,
          )
    return {
      name,
      score,
      matched: inCat.filter((s) => s.proficiency >= s.required).map((s) => s.name),
      missing: inCat.filter((s) => s.proficiency < s.required).map((s) => s.name),
    }
  })
}

export const overallReadiness = computeOverallReadiness()
export const skillCoverage = computeCoverage()

const coreSkills = skills.filter((s) => s.core)
export const matchedCount = coreSkills.filter((s) => s.proficiency >= s.required).length
export const coreCount = coreSkills.length
export const criticalGapCount = coreSkills.filter(
  (s) => s.status === "gap" && s.required - s.proficiency >= 40,
).length

// ---------------------------------------------------------------------------
// Demo user profile
// ---------------------------------------------------------------------------

export const user = {
  name: "Aarav Sharma",
  initials: "AS",
  email: "aarav.sharma@skillora.in",
  userType: "student" as UserType,
  userTypeLabel: "Student",
  targetRole: "Backend Engineer",
  experience: "Intermediate",
  jobReadiness: overallReadiness, // 78
  skillsMatched: matchedCount, // 8
  skillsRequired: coreCount, // 11
  criticalGaps: criticalGapCount, // 2
  recommendedJobs: 14,
  learningProgress: 42,
}

// ---------------------------------------------------------------------------
// Priority gaps (ranked by hiring demand, then gap size)
// ---------------------------------------------------------------------------

export const priorityGaps: PriorityGap[] = [
  {
    rank: 1,
    skill: "AWS",
    priority: "High",
    reason: "Required by 7 of your target jobs — the single biggest employability blocker.",
    jobsRequiring: 7,
    gap: 63,
  },
  {
    rank: 2,
    skill: "System Design",
    priority: "High",
    reason: "Frequently required for backend engineering interviews at senior levels.",
    jobsRequiring: 6,
    gap: 72,
  },
  {
    rank: 3,
    skill: "Docker",
    priority: "Medium",
    reason: "Expected for modern deployment workflows; you're already in progress here.",
    jobsRequiring: 5,
    gap: 45,
  },
]

// ---------------------------------------------------------------------------
// AI career insight (explanation layer — this is where Gemini plugs in)
// ---------------------------------------------------------------------------

export const careerInsight = {
  why: "Your strongest foundation is in programming fundamentals and databases, where you already meet or exceed the Backend Engineer benchmark.",
  what: "Your biggest employability gap is deployment and cloud infrastructure — AWS and Docker — followed by system design depth.",
  next: "Closing AWS and Docker could unlock additional matching roles and move you from 78% to interview-ready.",
}

// ---------------------------------------------------------------------------
// Personalized learning roadmap (impact-based, generated from gaps)
// ---------------------------------------------------------------------------

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "s1",
    order: 1,
    title: "Docker Fundamentals",
    closesSkill: "Docker",
    hours: 3,
    difficulty: "Beginner",
    impact: "High",
    readinessGain: 5,
    description: "Containerize services, write Dockerfiles, and manage images and volumes.",
  },
  {
    id: "s2",
    order: 2,
    title: "AWS Essentials",
    closesSkill: "AWS",
    hours: 6,
    difficulty: "Intermediate",
    impact: "High",
    readinessGain: 8,
    description: "Deploy backend services on EC2, S3, and RDS with IAM and networking basics.",
  },
  {
    id: "s3",
    order: 3,
    title: "System Design Foundations",
    closesSkill: "System Design",
    hours: 8,
    difficulty: "Advanced",
    impact: "Medium",
    readinessGain: 6,
    description: "Design scalable APIs, caching, queues, and databases for high-traffic systems.",
  },
]

export const targetReadiness = Math.min(
  95,
  overallReadiness + roadmapSteps.reduce((acc, s) => acc + s.readinessGain, 0),
) // ~90+

export const totalRoadmapHours = roadmapSteps.reduce((acc, s) => acc + s.hours, 0)

// Legacy phase-based roadmap (still exported for compatibility).
export const roadmap: RoadmapPhase[] = [
  {
    id: "p1",
    title: "Foundations Consolidated",
    status: "completed",
    duration: "Weeks 1–3",
    description: "Core backend fundamentals, data structures, and relational databases are verified.",
    skills: ["Python", "SQL", "DSA", "REST APIs"],
    courses: ["Backend Fundamentals", "SQL Deep Dive"],
  },
  {
    id: "p2",
    title: "Server-Side Depth",
    status: "active",
    duration: "Weeks 4–7",
    description: "Build production-grade services with Node.js and containerize them with Docker.",
    skills: ["Node.js", "Docker"],
    courses: ["Node.js Backend Masterclass", "Docker & Containers in Practice"],
  },
  {
    id: "p3",
    title: "Cloud & Scale",
    status: "upcoming",
    duration: "Weeks 8–12",
    description: "Deploy to AWS, learn scalable system design, and add caching with Redis.",
    skills: ["AWS", "System Design", "Redis"],
    courses: ["AWS Cloud Practitioner to Developer", "Scalable System Design"],
  },
]

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const courses: Course[] = [
  {
    id: "c1",
    title: "Node.js Backend Masterclass",
    provider: "Skillora Academy",
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
    provider: "Skillora Academy",
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

// ---------------------------------------------------------------------------
// Jobs (readiness computed against the user's skills)
// ---------------------------------------------------------------------------

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Backend Engineer",
    company: "TechNova",
    location: "Bengaluru, KA",
    type: "Full-time",
    salary: "₹8–12 LPA",
    experience: "1–3 years",
    posted: "2 days ago",
    readiness: 72,
    matchedSkills: ["Python", "SQL", "Git", "REST APIs"],
    missingSkills: ["Docker", "AWS", "System Design"],
    tags: ["Microservices", "PostgreSQL", "REST"],
  },
  {
    id: "j2",
    title: "Backend Developer Intern",
    company: "Razorpay",
    location: "Bengaluru, KA",
    type: "Internship",
    salary: "₹40k/month",
    experience: "0–1 years",
    posted: "3 days ago",
    readiness: 84,
    matchedSkills: ["Python", "SQL", "REST APIs", "Git", "PostgreSQL"],
    missingSkills: ["Docker"],
    tags: ["Payments", "Node.js", "PostgreSQL"],
  },
  {
    id: "j3",
    title: "Software Engineer — Backend",
    company: "Zoho",
    location: "Chennai, TN",
    type: "Full-time",
    salary: "₹10–15 LPA",
    experience: "1–3 years",
    posted: "4 days ago",
    readiness: 70,
    matchedSkills: ["SQL", "DSA", "Git", "OOP"],
    missingSkills: ["Docker", "AWS"],
    tags: ["Java", "Distributed Systems"],
  },
  {
    id: "j4",
    title: "API Engineer",
    company: "Postman",
    location: "Hyderabad, TS",
    type: "Full-time",
    salary: "₹16–22 LPA",
    experience: "2–4 years",
    posted: "5 days ago",
    readiness: 64,
    matchedSkills: ["REST APIs", "Git", "PostgreSQL"],
    missingSkills: ["AWS", "System Design"],
    tags: ["API", "Node.js", "Cloud"],
  },
  {
    id: "j5",
    title: "Platform Engineer",
    company: "Freshworks",
    location: "Remote, India",
    type: "Full-time",
    salary: "₹14–20 LPA",
    experience: "2–4 years",
    posted: "1 week ago",
    readiness: 52,
    matchedSkills: ["Python", "Linux", "REST APIs"],
    missingSkills: ["Docker", "Kubernetes", "AWS"],
    tags: ["Cloud", "Kubernetes", "CI/CD"],
  },
  {
    id: "j6",
    title: "Backend Engineer — Fintech",
    company: "CRED",
    location: "Bengaluru, KA",
    type: "Full-time",
    salary: "₹18–26 LPA",
    experience: "3–5 years",
    posted: "6 days ago",
    readiness: 58,
    matchedSkills: ["Python", "SQL", "REST APIs", "DSA"],
    missingSkills: ["AWS", "System Design", "Docker"],
    tags: ["Fintech", "Scale", "AWS"],
  },
  {
    id: "j7",
    title: "Junior Backend Developer",
    company: "Zerodha",
    location: "Bengaluru, KA",
    type: "Full-time",
    salary: "₹9–13 LPA",
    experience: "0–2 years",
    posted: "1 day ago",
    readiness: 80,
    matchedSkills: ["Python", "SQL", "Git", "REST APIs", "Linux"],
    missingSkills: ["Docker"],
    tags: ["Python", "PostgreSQL"],
  },
  {
    id: "j8",
    title: "Backend Engineer",
    company: "Swiggy",
    location: "Bengaluru, KA",
    type: "Full-time",
    salary: "₹15–22 LPA",
    experience: "2–4 years",
    posted: "3 days ago",
    readiness: 60,
    matchedSkills: ["Python", "SQL", "REST APIs"],
    missingSkills: ["AWS", "System Design", "Kubernetes"],
    tags: ["Scale", "Microservices", "AWS"],
  },
  {
    id: "j9",
    title: "Backend Developer",
    company: "Groww",
    location: "Bengaluru, KA",
    type: "Full-time",
    salary: "₹12–18 LPA",
    experience: "1–3 years",
    posted: "2 days ago",
    readiness: 66,
    matchedSkills: ["Python", "SQL", "Git", "OOP"],
    missingSkills: ["Docker", "AWS"],
    tags: ["Fintech", "REST", "PostgreSQL"],
  },
  {
    id: "j10",
    title: "Associate Software Engineer",
    company: "Infosys",
    location: "Pune, MH",
    type: "Full-time",
    salary: "₹6–9 LPA",
    experience: "0–1 years",
    posted: "1 week ago",
    readiness: 82,
    matchedSkills: ["Python", "SQL", "DSA", "Git", "OOP"],
    missingSkills: ["Docker"],
    tags: ["Java", "SQL", "Fundamentals"],
  },
]

// Signature target for the Job Readiness screen: TechNova Backend Engineer.
export const readinessTarget = jobs[0]

// ---------------------------------------------------------------------------
// Job-specific readiness breakdown (signature feature)
// ---------------------------------------------------------------------------

export type JobRequirementComparison = {
  skill: string
  required: number
  proficiency: number
  status: "have" | "partial" | "missing"
}

const CORE_JOB_REQUIREMENTS = [
  "Python",
  "SQL",
  "Git",
  "REST APIs",
  "Docker",
  "AWS",
  "System Design",
]

export const jobReadinessDetail = {
  job: readinessTarget,
  overall: readinessTarget.readiness, // 72
  comparison: CORE_JOB_REQUIREMENTS.map((name): JobRequirementComparison => {
    const s = skills.find((sk) => sk.name === name)
    const proficiency = s?.proficiency ?? 0
    const required = s?.required ?? 75
    const ratio = required > 0 ? proficiency / required : 1
    const status: JobRequirementComparison["status"] =
      ratio >= 1 ? "have" : ratio >= 0.5 ? "partial" : "missing"
    return { skill: name, required, proficiency, status }
  }),
  // "Why you're not ready yet" — ordered by blocking severity.
  blockers: ["AWS", "System Design", "Docker"],
  // "Fastest path to readiness" — ordered learning sequence.
  fastestPath: ["Docker", "AWS", "System Design"],
  estimatedHours: totalRoadmapHours + 6, // ~17 hours
  projectedReadiness: 90,
}

// ---------------------------------------------------------------------------
// Employment journey (lightweight, honest about prototype stages)
// ---------------------------------------------------------------------------

export type JourneyStage = {
  id: string
  label: string
  status: "done" | "current" | "upcoming"
  note?: string
}

export const employmentJourney: JourneyStage[] = [
  { id: "e1", label: "Assessment", status: "done" },
  { id: "e2", label: "Learning", status: "done" },
  { id: "e3", label: "Skills Improved", status: "done" },
  { id: "e4", label: "Job Matched", status: "current" },
  { id: "e5", label: "Application", status: "upcoming", note: "Tracked in a future release" },
  { id: "e6", label: "Interview", status: "upcoming", note: "Tracked in a future release" },
  { id: "e7", label: "Placed", status: "upcoming", note: "Tracked in a future release" },
]

// Career-readiness pipeline shown on the dashboard.
export const careerPipeline = [
  { id: "cp1", label: "Current Profile", status: "done" as const },
  { id: "cp2", label: "Skill Gap Analysis", status: "done" as const },
  { id: "cp3", label: "Learning Path", status: "current" as const },
  { id: "cp4", label: "Job Matching", status: "upcoming" as const },
  { id: "cp5", label: "Employment Ready", status: "upcoming" as const },
]

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

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
    detail: "Docker proficiency increased to 30%",
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
