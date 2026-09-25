const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const TOKEN_KEY = 'applytrack.token'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // Stockage indisponible (navigation privée) : la session ne survivra pas au rechargement
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // idem
    }
  },
}

/**
 * Requêtes lentes : l'hébergement gratuit met l'API en veille, et le premier appel peut prendre
 * jusqu'à une minute. On notifie l'interface au-delà de SLOW_REQUEST_MS pour afficher un message.
 */
const SLOW_REQUEST_MS = 3000
let slowRequests = 0
const slowListeners = new Set<(isSlow: boolean) => void>()

export function onSlowRequestChange(listener: (isSlow: boolean) => void): () => void {
  slowListeners.add(listener)
  return () => {
    slowListeners.delete(listener)
  }
}

function setSlowRequests(count: number) {
  const wasSlow = slowRequests > 0
  slowRequests = count
  if (wasSlow !== slowRequests > 0) slowListeners.forEach((listener) => listener(slowRequests > 0))
}

async function trackSlowRequest<T>(request: Promise<T>): Promise<T> {
  let flagged = false
  const timer = setTimeout(() => {
    flagged = true
    setSlowRequests(slowRequests + 1)
  }, SLOW_REQUEST_MS)
  try {
    return await request
  } finally {
    clearTimeout(timer)
    if (flagged) setSlowRequests(slowRequests - 1)
  }
}

/** Réveille l'API dès l'arrivée sur le site, avant même que l'utilisateur se connecte. */
export function warmUpApi() {
  fetch(`${API_URL}/actuator/health`).catch(() => {
    // Sans importance : la vraie requête affichera l'erreur si l'API est vraiment indisponible
  })
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')

  const token = tokenStorage.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await trackSlowRequest(fetch(`${API_URL}${path}`, { ...init, headers }))
  } catch {
    // Erreur réseau ou CORS : fetch ne donne aucun détail, on affiche un message compréhensible
    throw new ApiError(0, 'Impossible de joindre le serveur. Réessaie dans quelques instants.')
  }

  if (!response.ok) {
    // Le back renvoie des erreurs au format RFC 9457 (ProblemDetail)
    const problem = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      problem?.detail ?? `Erreur ${response.status}`,
      problem?.errors ?? {},
    )
  }

  return response.status === 204 ? (undefined as T) : response.json()
}
