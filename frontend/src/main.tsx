import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { warmUpApi } from './api/client'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { ServerWakeBanner } from './components/ServerWakeBanner'
import { Toaster } from './components/Toaster'
import './index.css'

warmUpApi()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ServerWakeBanner />
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
