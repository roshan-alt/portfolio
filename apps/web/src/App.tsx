import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const Portfolio = lazy(() => import('./pages/Portfolio').then((m) => ({ default: m.Portfolio })))
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))
const BlogDetail = lazy(() => import('./pages/BlogDetail').then((m) => ({ default: m.BlogDetail })))
const ExperienceDetail = lazy(() =>
  import('./pages/ExperienceDetail').then((m) => ({ default: m.ExperienceDetail })),
)
const ProjectDetail = lazy(() =>
  import('./pages/ProjectDetail').then((m) => ({ default: m.ProjectDetail })),
)

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

  return (
    <BrowserRouter basename={basename}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
