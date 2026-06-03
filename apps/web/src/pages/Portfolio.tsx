import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ContactSection } from '../components/ContactSection'
import { CustomCursor } from '../components/CustomCursor'
import { DateLine } from '../components/DateLine'
import { SiteScrollBackground } from '../components/DisciplineScrollVisual'
import { ExperienceTimeline } from '../components/ExperienceTimeline'
import { BlogPostsList } from '../components/BlogPostsList'
import { PublicationsTimeline } from '../components/PublicationsTimeline'
import { SiteFooter } from '../components/SiteFooter'
import { SkillsSection } from '../components/SkillsSection'
import { Section } from '../components/ScrollSection'
import { ContentError, ContentLoading } from '../components/ContentStatus'
import { ScrollNav } from '../components/ScrollNav'
import { useContent } from '../hooks/useContent'
import { buildPortfolioNavItems } from '../lib/buildPortfolioNav'
import { externalRel, safeHttpUrl, safeMailto } from '../utils/safeUrl'

export function Portfolio() {
  const { data, loading, error, slow, refreshing } = useContent()

  if (loading && !data) {
    return <ContentLoading slow={slow} />
  }

  if ((error && !data) || !data) {
    return <ContentError error={error ?? 'No content returned from API'} />
  }

  const p = data.profile
  const mailto = safeMailto(p.email)
  const websiteUrl = safeHttpUrl(p.website_url)
  const linkedinUrl = safeHttpUrl(p.linkedin_url)
  const githubUrl = safeHttpUrl(p.github_url)
  const navItems = buildPortfolioNavItems(data, !!p.summary)
  const navBrand = p.full_name?.split(/\s+/)[0] || 'Home'

  return (
    <>
      {refreshing && (
        <div
          className="fixed top-3 right-3 z-50 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] uppercase tracking-widest text-zinc-400"
          aria-live="polite"
        >
          Updating…
        </div>
      )}
      <CustomCursor />
      <ScrollNav brand={navBrand} items={navItems} />
      <SiteScrollBackground images={p.floating_images || []} />

      <div className="relative z-10">
      <header id="top" className="relative min-h-screen flex flex-col justify-center items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-teal-400 text-sm tracking-[0.3em] uppercase mb-6"
        >
          {p.hero_tagline || p.headline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white max-w-4xl leading-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]"
        >
          {p.full_name || 'Your Name'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-zinc-500 text-lg max-w-xl"
        >
          {p.headline}
        </motion.p>

        {p.location && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-zinc-600 text-sm"
          >
            {p.location}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 mt-10 flex-wrap justify-center"
        >
          {mailto && (
            <a
              href={mailto}
              data-cursor="hover"
              className="px-6 py-3 rounded-full bg-teal-500 text-black font-semibold hover:bg-teal-400 transition-colors"
            >
              Contact
            </a>
          )}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel={externalRel()}
              data-cursor="hover"
              className="px-6 py-3 rounded-full border border-white/20 hover:border-teal-400/50 transition-colors"
            >
              Website
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel={externalRel()}
              data-cursor="hover"
              className="px-6 py-3 rounded-full border border-white/20 hover:border-teal-400/50 transition-colors"
            >
              LinkedIn
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel={externalRel()}
              data-cursor="hover"
              className="px-6 py-3 rounded-full border border-white/20 hover:border-teal-400/50 transition-colors"
            >
              GitHub
            </a>
          )}
        </motion.div>

        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 text-zinc-600 text-sm"
        >
          scroll ↓
        </motion.span>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-32 space-y-32">
        {p.summary && (
          <Section title="About" index={0} id="about">
            <p className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">{p.summary}</p>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="Experience" index={1} id="experience">
            <ExperienceTimeline items={data.experience} />
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education" index={2} id="education">
            <div className="space-y-6">
              {data.education.map((e, i) => (
                <EntryCard key={e.id} index={i}>
                  <h3 className="text-white font-semibold text-xl">{e.school}</h3>
                  <p className="text-zinc-400 text-sm mt-1">
                    {[e.degree, e.field].filter(Boolean).join(' · ')}
                  </p>
                  <DateLine start={e.start_date} end={e.end_date} />
                  {e.description && <p className="text-zinc-400 mt-3 text-sm whitespace-pre-wrap">{e.description}</p>}
                </EntryCard>
              ))}
            </div>
          </Section>
        )}

        {data.certifications.length > 0 && (
          <Section title="Licenses & Certifications" index={3} id="certifications">
            <div className="space-y-4">
              {data.certifications.map((c, i) => (
                <EntryCard key={c.id} index={i}>
                  <h3 className="text-white font-medium">{c.title}</h3>
                  {c.issuer && <p className="text-zinc-500 text-sm mt-1">{c.issuer}</p>}
                  <DateLine start={c.issue_date} end={c.expiry_date} endLabel="Expires" />
                  {(() => {
                    const credUrl = safeHttpUrl(c.credential_url)
                    return credUrl ? (
                    <a
                      href={credUrl}
                      target="_blank"
                      rel={externalRel()}
                      className="text-teal-400 text-sm mt-2 inline-block"
                      data-cursor="hover"
                    >
                      View credential
                    </a>
                    ) : null
                  })()}
                </EntryCard>
              ))}
            </div>
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title="Projects" index={4} id="projects">
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/projects/${proj.id}`}
                    data-cursor="hover"
                    className="group block rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md hover:border-teal-500/40 transition-all hover:-translate-y-1"
                  >
                    {proj.image_url && (
                      <img src={proj.image_url} alt="" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-white font-medium group-hover:text-teal-100 transition-colors truncate">
                            {proj.title}
                          </h3>
                          {proj.featured && (
                            <span className="text-[10px] uppercase tracking-wider text-teal-400 shrink-0">Featured</span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-600 group-hover:text-teal-400 shrink-0">→</span>
                      </div>
                      <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{proj.description}</p>
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {proj.tags.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {data.blog_posts?.length > 0 && (
          <Section title="Blog" index={5} id="blog">
            <BlogPostsList posts={data.blog_posts} />
          </Section>
        )}

        {data.volunteer.length > 0 && (
          <Section title="Volunteer" index={6} id="volunteer">
            <div className="space-y-6">
              {data.volunteer.map((v, i) => (
                <EntryCard key={v.id} index={i}>
                  <h3 className="text-white font-semibold text-xl">
                    {v.role ? `${v.role} · ${v.organization}` : v.organization}
                  </h3>
                  {v.cause && <p className="text-zinc-500 text-sm mt-1">{v.cause}</p>}
                  <DateLine start={v.start_date} end={v.end_date} />
                  {v.description && <p className="text-zinc-400 mt-3 text-sm whitespace-pre-wrap">{v.description}</p>}
                </EntryCard>
              ))}
            </div>
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="Skills" index={7} id="skills">
            <SkillsSection skills={data.skills} projects={data.projects} />
          </Section>
        )}

        {data.languages.length > 0 && (
          <Section title="Languages" index={8} id="languages">
            <ul className="space-y-2">
              {data.languages.map((l) => (
                <li key={l.id} className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-white">{l.name}</span>
                  {l.proficiency && <span className="text-zinc-500">{l.proficiency}</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.honors.length > 0 && (
          <Section title="Honors & Awards" index={9} id="honors">
            <div className="space-y-4">
              {data.honors.map((h, i) => (
                <EntryCard key={h.id} index={i}>
                  <h3 className="text-white font-medium">{h.title}</h3>
                  {h.issuer && <p className="text-zinc-500 text-sm mt-1">{h.issuer}</p>}
                  {h.issue_date && <p className="text-zinc-600 text-xs mt-1">{h.issue_date}</p>}
                  {h.description && <p className="text-zinc-400 mt-2 text-sm">{h.description}</p>}
                </EntryCard>
              ))}
            </div>
          </Section>
        )}

        {data.publications.length > 0 && (
          <Section title="Publications" index={10} id="publications">
            <PublicationsTimeline items={data.publications} />
          </Section>
        )}

        {data.courses.length > 0 && (
          <Section title="Courses" index={11} id="courses">
            <ul className="space-y-3">
              {data.courses.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="text-white">{c.name}</span>
                  {c.number && <span className="text-zinc-500"> · {c.number}</span>}
                  {c.associated_with && <span className="text-zinc-600"> — {c.associated_with}</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.recommendations.length > 0 && (
          <Section title="Recommendations" index={12} id="recommendations">
            <div className="space-y-6">
              {data.recommendations.map((r, i) => (
                <EntryCard key={r.id} index={i}>
                  <p className="text-zinc-400 text-sm italic whitespace-pre-wrap">&ldquo;{r.text}&rdquo;</p>
                  <p className="text-white font-medium mt-4">{r.recommender_name}</p>
                  <p className="text-zinc-500 text-sm">
                    {[r.recommender_title, r.relationship].filter(Boolean).join(' · ')}
                  </p>
                </EntryCard>
              ))}
            </div>
          </Section>
        )}

        <Section title="Contact" index={13} id="contact">
          <ContactSection profile={p} />
        </Section>
      </main>

      <SiteFooter name={p.full_name} />
      </div>
    </>
  )
}

function EntryCard({
  children,
  index,
}: {
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="p-6 rounded-2xl bg-[#0a0a0f]/50 backdrop-blur-md border border-white/10 hover:border-teal-500/30 transition-colors"
      data-cursor="hover"
    >
      {children}
    </motion.article>
  )
}
