import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router'
import { useAuth } from './auth/useAuth'
import { Layout } from './components/Layout'
import { AuthPage } from './pages/AuthPage'
import { BoardPage } from './pages/BoardPage'
import { StatsPage } from './pages/StatsPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <p className="p-6 text-slate-500">Chargement…</p>
  return user ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user ? <Navigate to="/" replace /> : children
}

const router = createBrowserRouter([
  {
    element: <RequireAuth><Layout /></RequireAuth>,
    children: [
      { path: '/', element: <BoardPage /> },
      { path: '/stats', element: <StatsPage /> },
    ],
  },
  { path: '/login', element: <GuestOnly><AuthPage mode="login" /></GuestOnly> },
  { path: '/register', element: <GuestOnly><AuthPage mode="register" /></GuestOnly> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
