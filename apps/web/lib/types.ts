export type SessionStatus = 'asking' | 'resolving' | 'done' | 'failed';

export type SessionView = {
  sessionId: string;
  status: SessionStatus;
  question: string | null;
  options: string[];
  questionCount: number;
  totalSteps: number;
  gaps: SkillGap[];
  error?: string;
};

export type SkillGap = {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  severity: number;
  rationale?: string;
};

export type Recommendation = {
  resourceId: string;
  kind: 'course' | 'job';
  title: string;
  url: string;
  provider: string;
  level: string;
  durationMins: number | null;
  matchedSkills: string[];
  score: number;
};

export type RecommendationPayload = {
  sessionId: string;
  gaps: SkillGap[];
  recommendations: Recommendation[];
  cached: boolean;
};

export type CatalogueResource = {
  id: string;
  kind: 'course' | 'job';
  title: string;
  url: string;
  provider: string;
  level: string;
  durationMins: number | null;
  skills: string[];
};

export type Skill = { id: string; slug: string; name: string; category: string };
