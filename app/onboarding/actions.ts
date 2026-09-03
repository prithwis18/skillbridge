'use server'

import { createClient } from '@/lib/supabase/server'

const VALID_TYPES = ['student', 'job_seeker', 'working_professional', 'other']

export async function saveOnboarding(input: {
  userType: string
  targetRole: string
  skills: string[]
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const userType = VALID_TYPES.includes(input.userType)
    ? input.userType
    : 'other'
  const targetRole = input.targetRole.trim().slice(0, 120)

  // Persist the core profile fields (RLS scopes this to the current user).
  const { error } = await supabase
    .from('profiles')
    .update({ user_type: userType, target_role: targetRole })
    .eq('id', user.id)

  if (error) {
    console.error('saveOnboarding error:', error.message)
    return { error: 'Could not save your profile. Please try again.' }
  }

  // Skills aren't a profile column yet — keep them on the auth user metadata
  // so the assessment can pre-fill without over-engineering the schema.
  await supabase.auth.updateUser({
    data: { known_skills: input.skills.slice(0, 40) },
  })

  return { error: null }
}
