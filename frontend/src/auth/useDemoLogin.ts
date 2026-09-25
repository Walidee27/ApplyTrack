import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/endpoints'
import { useAuth } from './useAuth'

/** Compte public recréé chaque nuit par le back (voir DemoDataService). */
const DEMO_ACCOUNT = { email: 'demo@example.com', password: 'demo12345' }

export const DEMO_ENABLED = import.meta.env.VITE_DEMO_ENABLED === 'true'

/** Connexion en un clic au compte de démo, puis ouverture du tableau. */
export function useDemoLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => authApi.login(DEMO_ACCOUNT),
    onSuccess: (response) => {
      signIn(response)
      navigate('/app', { replace: true })
    },
  })
}
