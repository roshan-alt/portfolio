export type Profile = {
  full_name: string
  headline: string
  summary: string
  location: string
  email: string
  avatar_url: string
  linkedin_url: string
  github_url: string
  website_url: string
  hero_tagline: string
  floating_images: string[]
}

export type Experience = {
  id: string
  company: string
  title: string
  location: string
  start_date: string
  end_date: string | null
  description: string
  order: number
}

export type Education = {
  id: string
  school: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
  description: string
  order: number
}

export type Skill = { id: string; name: string; order: number }

export type Project = {
  id: string
  title: string
  description: string
  url: string
  image_url: string
  tags: string[]
  featured: boolean
  order: number
}

export type BlogPost = {
  id: string
  title: string
  excerpt: string
  body: string
  cover_image_url: string
  tags: string[]
  published_date: string
  published: boolean
  order: number
}

export type Certification = {
  id: string
  title: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  credential_id: string
  credential_url: string
  order: number
}

export type Language = {
  id: string
  name: string
  proficiency: string
  order: number
}

export type Volunteer = {
  id: string
  organization: string
  role: string
  cause: string
  start_date: string
  end_date: string | null
  description: string
  order: number
}

export type Honor = {
  id: string
  title: string
  issuer: string
  issue_date: string
  description: string
  order: number
}

export type Publication = {
  id: string
  title: string
  publisher: string
  publication_date: string
  url: string
  description: string
  order: number
}

export type Course = {
  id: string
  name: string
  number: string
  associated_with: string
  order: number
}

export type Recommendation = {
  id: string
  recommender_name: string
  recommender_title: string
  relationship: string
  text: string
  date: string
  order: number
}

export type Content = {
  profile: Profile
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects: Project[]
  blog_posts: BlogPost[]
  certifications: Certification[]
  languages: Language[]
  volunteer: Volunteer[]
  honors: Honor[]
  publications: Publication[]
  courses: Course[]
  recommendations: Recommendation[]
}

export type SectionKey =
  | 'profile'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'projects'
  | 'blog_posts'
  | 'volunteer'
  | 'skills'
  | 'languages'
  | 'honors'
  | 'publications'
  | 'courses'
  | 'recommendations'
