// Deterministic Skill Intelligence engine.
//
// Every quantitative value in Skillora (readiness %, gap size, coverage,
// projected readiness) is computed here from explicit inputs — never from an
// AI model. This keeps results explainable and reproducible for judging.

import {
  roleRequirements,
  userSkillLevels,
  type RequiredSkill,
  type SkillCategory,
} from "@/lib/mock-data"

export type SkillComparison = {
  name: string
  category: SkillCategory
  required: number
  current: number
  gap: number
  status: "matched" | "weak" | "missing"
}

/** Classify a single skill against its required level. */
export function classifySkill(required: number, current: number): SkillComparison["status"] {
  if (current >= required) return "matched"
  if (current === 0) return "missing"
  return "weak"
}

/** Build the full comparison of user levels vs. role requirements. */
export function compareSkills(
  requirements: RequiredSkill[] = roleRequirements,
  levels: Record<string, number> = userSkillLevels,
): SkillComparison[] {
  return requirements.map((req) => {
    const current = levels[req.name] ?? 0
    return {
      name: req.name,
      category: req.category,
      required: req.required,
      current,
      gap: Math.max(0, req.required - current),
      status: classifySkill(req.required, current),
    }
  })
}

/**
 * Overall readiness: the share of required proficiency the user has attained,
 * capped per-skill so over-qualification in one area cannot mask a gap in
 * another. Returns a 0-100 integer.
 */
export function computeReadiness(
  requirements: RequiredSkill[] = roleRequirements,
  levels: Record<string, number> = userSkillLevels,
): number {
  const totalRequired = requirements.reduce((sum, r) => sum + r.required, 0)
  if (totalRequired === 0) return 0
  const attained = requirements.reduce((sum, r) => {
    const current = Math.min(levels[r.name] ?? 0, r.required)
    return sum + current
  }, 0)
  return Math.round((attained / totalRequired) * 100)
}

export type CategoryCoverage = {
  category: SkillCategory
  score: number
  matched: string[]
  missing: string[]
  weak: string[]
}

/** Per-category coverage map for the Skill Gap Analysis page. */
export function categoryCoverage(
  requirements: RequiredSkill[] = roleRequirements,
  levels: Record<string, number> = userSkillLevels,
): CategoryCoverage[] {
  const comparisons = compareSkills(requirements, levels)
  const categories = [...new Set(requirements.map((r) => r.category))] as SkillCategory[]

  return categories.map((category) => {
    const items = comparisons.filter((c) => c.category === category)
    const totalRequired = items.reduce((s, c) => s + c.required, 0)
    const attained = items.reduce((s, c) => s + Math.min(c.current, c.required), 0)
    return {
      category,
      score: totalRequired === 0 ? 0 : Math.round((attained / totalRequired) * 100),
      matched: items.filter((c) => c.status === "matched").map((c) => c.name),
      weak: items.filter((c) => c.status === "weak").map((c) => c.name),
      missing: items.filter((c) => c.status === "missing").map((c) => c.name),
    }
  })
}

/** Readiness a user would reach after closing a set of skills (to required level). */
export function projectedReadiness(
  skillsToClose: string[],
  requirements: RequiredSkill[] = roleRequirements,
  levels: Record<string, number> = userSkillLevels,
): number {
  const improved = { ...levels }
  for (const skill of skillsToClose) {
    const req = requirements.find((r) => r.name === skill)
    if (req) improved[skill] = req.required
  }
  return computeReadiness(requirements, improved)
}

/** Score color band shared across the UI. */
export function readinessBand(value: number): "success" | "warning" | "danger" {
  if (value >= 75) return "success"
  if (value >= 55) return "warning"
  return "danger"
}
