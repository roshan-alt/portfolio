import type { Content } from '../types'

export type NavItem = { id: string; label: string }

const MAIN_MAX = 4

export function buildPortfolioNavItems(data: Content, hasSummary: boolean): NavItem[] {
  const items: NavItem[] = [{ id: 'top', label: 'Home' }]
  if (hasSummary) items.push({ id: 'about', label: 'About' })
  if (data.experience.length > 0) items.push({ id: 'experience', label: 'Experience' })
  if (data.projects.length > 0) items.push({ id: 'projects', label: 'Work' })
  if (data.blog_posts?.length > 0) items.push({ id: 'blog', label: 'Blog' })
  if (data.education.length > 0) items.push({ id: 'education', label: 'Education' })
  if (data.skills.length > 0) items.push({ id: 'skills', label: 'Skills' })
  if (data.certifications.length > 0) items.push({ id: 'certifications', label: 'Certs' })
  return items
}

export function partitionNavItems(items: NavItem[]): { main: NavItem[]; more: NavItem[] } {
  if (items.length <= MAIN_MAX + 1) {
    return { main: items, more: [] }
  }
  return { main: items.slice(0, MAIN_MAX + 1), more: items.slice(MAIN_MAX + 1) }
}
