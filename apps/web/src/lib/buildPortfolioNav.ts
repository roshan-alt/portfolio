import type { Content } from '../types'

export type NavItem = { id: string; label: string }

export function buildPortfolioNavItems(data: Content, hasSummary: boolean): NavItem[] {
  const items: NavItem[] = []
  if (hasSummary) items.push({ id: 'about', label: 'About' })
  if (data.experience.length > 0) items.push({ id: 'experience', label: 'Experience' })
  if (data.education.length > 0) items.push({ id: 'education', label: 'Education' })
  if (data.certifications.length > 0) items.push({ id: 'certifications', label: 'Certs' })
  if (data.projects.length > 0) items.push({ id: 'projects', label: 'Projects' })
  if (data.blog_posts?.length > 0) items.push({ id: 'blog', label: 'Blog' })
  if (data.skills.length > 0) items.push({ id: 'skills', label: 'Skills' })
  items.push({ id: 'contact', label: 'Contact' })
  return items
}
