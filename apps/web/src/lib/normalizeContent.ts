import type { Content, Profile } from '../types'

const emptyProfile: Profile = {
  full_name: '',
  headline: '',
  summary: '',
  location: '',
  email: '',
  avatar_url: '',
  linkedin_url: '',
  github_url: '',
  website_url: '',
  hero_tagline: '',
  floating_images: [],
}

export function normalizeContent(raw: Partial<Content> & { profile?: Partial<Profile> }): Content {
  return {
    profile: { ...emptyProfile, ...raw.profile },
    experience: raw.experience ?? [],
    education: raw.education ?? [],
    skills: raw.skills ?? [],
    projects: raw.projects ?? [],
    blog_posts: raw.blog_posts ?? [],
    certifications: raw.certifications ?? [],
    languages: raw.languages ?? [],
    volunteer: raw.volunteer ?? [],
    honors: raw.honors ?? [],
    publications: raw.publications ?? [],
    courses: raw.courses ?? [],
    recommendations: raw.recommendations ?? [],
  }
}
