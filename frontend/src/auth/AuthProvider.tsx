import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { tokenStorage } from '../api/client'
import { authApi } from '../api/endpoints'
import type { AuthResponse, User } from '../api/types'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => tokenStorage.get())

  // Au démarrage, on revalide le jeton stocké auprès du back
  const { data: user, isLoading } = useQuery({
    queryKey: ['me', token],
    queryFn: authApi.me,
    enabled: token !== null,
    retry: false,
  })

  const signIn = useCallback(
    (response: AuthResponse) => {
      tokenStorage.set(response.token)
      queryClient.setQueryData(['me', response.token], response.user)
      setToken(response.token)
    },
    [queryClient],
  )

  const signOut = useCallback(() => {
    tokenStorage.clear()
    queryClient.clear()
    setToken(null)
  }, [queryClient])

  const updateUser = useCallback(
    (updated: User) => queryClient.setQueryData(['me', token], updated),
    [queryClient, token],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? (user ?? null) : null,
      isLoading: token !== null && isLoading,
      signIn,
      signOut,
      updateUser,
    }),
    [token, user, isLoading, signIn, signOut, updateUser],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
