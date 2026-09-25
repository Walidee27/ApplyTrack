import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router'
import { useAuth } from './auth/useAuth'
import { Layout } from './components/Layout'
import { Spinner } from './components/ui'
import { AuthPage } from './pages/AuthPage'
import { BoardPage } from './pages/BoardPage'
import { LandingPage } from './pages/LandingPage'
import { StatsPage } from './pages/StatsPage'

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-ink-muted">
      <Spinner /> Chargement…
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader />
  return user ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader />
  return user ? <Navigate to="/app" replace /> : children
}

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    path: '/app',
    element: <RequireAuth><Layout /></RequireAuth>,
    children: [
      { index: true, element: <BoardPage /> },
      { path: 'stats', element: <StatsPage /> },
    ],
  },
  { path: '/login', element: <GuestOnly><AuthPage mode="login" /></GuestOnly> },
  { path: '/register', element: <GuestOnly><AuthPage mode="register" /></GuestOnly> },
  // Anciennes adresses, avant le déplacement de l'application sous /app
  { path: '/stats', element: <Navigate to="/app/stats" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
