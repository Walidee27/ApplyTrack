import { createContext } from 'react'
import type { AuthResponse, User } from '../api/types'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (response: AuthResponse) => void
  signOut: () => void
  /** Remplace l'utilisateur en cache après une modification (préférences…) */
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
