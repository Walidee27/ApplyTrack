import { Link } from 'react-router'
import { ApiError } from '../api/client'
import { DEMO_ENABLED, useDemoLogin } from '../auth/useDemoLogin'
import { useAuth } from '../auth/useAuth'
import { BoardPreview } from '../components/BoardPreview'
import { ButtonLink, Card, Logo, Spinner, ThemeToggle } from '../components/ui'
import { buttonClass } from '../lib/button'

const REPO_URL = 'https://github.com/Walidee27/ApplyTrack'

const FEATURES = [
  {
    icon: '📋',
    title: 'Un kanban pour chaque étape',
    text: "Envoyée, relancée, entretien, offre : fais glisser tes candidatures d'une colonne à l'autre et vois où tu en es d'un coup d'œil.",
  },
  {
    icon: '⏰',
    title: 'Des relances au bon moment',
    text: "Sans nouvelles depuis une semaine ? ApplyTrack te l'indique sur le tableau et t'envoie un récapitulatif par e-mail chaque matin.",
  },
  {
    icon: '📊',
    title: 'Tes vrais chiffres',
    text: "Taux de réponse, taux d'entretien, délai moyen avant la première réponse : de quoi savoir ce qui marche dans tes candidatures.",
  },
]

const STACK = [
  { area: 'Front-end', items: ['React 19', 'TypeScript', 'TanStack Query', 'Tailwind CSS', 'dnd-kit'] },
  { area: 'Back-end', items: ['Java 21', 'Spring Boot 3', 'Spring Security (JWT)', 'JPA / Hibernate', 'Flyway'] },
  { area: 'Qualité', items: ['JUnit 5', 'Testcontainers', 'Vitest', 'GitHub Actions'] },
  { area: 'Infra', items: ['Docker', 'PostgreSQL (Neon)', 'Render', 'Vercel'] },
]

export function LandingPage() {
  const { user } = useAuth()
  const demo = useDemoLogin()
  const demoError = demo.error instanceof ApiError ? demo.error.message : null

  const primaryCta = user ? (
    <ButtonLink to="/app" size="lg">
      Ouvrir mon tableau →
    </ButtonLink>
  ) : DEMO_ENABLED ? (
    <button type="button" onClick={() => demo.mutate()} disabled={demo.isPending} className={buttonClass('primary', 'lg')}>
      {demo.isPending ? (
        <>
          <Spinner /> Ouverture de la démo…
        </>
      ) : (
        'Essayer la démo, sans inscription'
      )}
    </button>
  ) : (
    <ButtonLink to="/register" size="lg">
      Créer un compte gratuit
    </ButtonLink>
  )

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-5">
        <Link to="/" aria-label="ApplyTrack, accueil">
          <Logo />
        </Link>
        <nav className="ml-8 hidden gap-6 text-sm font-medium text-ink-muted md:flex" aria-label="Sections">
          <a href="#fonctionnalites" className="hover:text-ink">Fonctionnalités</a>
          <a href="#sous-le-capot" className="hover:text-ink">Sous le capot</a>
          <a href={REPO_URL} className="hover:text-ink">GitHub</a>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <ButtonLink to="/app">Mon tableau</ButtonLink>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost">Connexion</ButtonLink>
              <span className="hidden sm:inline-flex">
                <ButtonLink to="/register">S'inscrire</ButtonLink>
              </span>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Accroche */}
        <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-20 text-center sm:pt-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-brand/15 blur-3xl"
            aria-hidden="true"
          />
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-muted ring-1 ring-line">
            <span className="h-1.5 w-1.5 rounded-full bg-status-offer" /> Pour les recherches de stage et d'alternance
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Suis tes candidatures. <span className="text-brand">Relance au bon moment.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-balance text-ink-muted">
            ApplyTrack réunit toutes tes candidatures dans un tableau clair, te rappelle celles qui attendent une relance et te
            montre ce qui fonctionne vraiment.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryCta}
            {!user && (
              <ButtonLink to={DEMO_ENABLED ? '/register' : '/login'} variant="secondary" size="lg">
                {DEMO_ENABLED ? 'Créer mon compte' : 'Se connecter'}
              </ButtonLink>
            )}
          </div>
          {demoError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {demoError}
            </p>
          )}
          {DEMO_ENABLED && !user && (
            <p className="mt-4 text-xs text-ink-faint">Données fictives, réinitialisées chaque nuit.</p>
          )}

          <div className="mx-auto mt-16 max-w-5xl text-left">
            <BoardPreview />
          </div>
        </section>

        {/* Fonctionnalités */}
        <section id="fonctionnalites" className="border-y border-line bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">Tout ce qu'un tableur ne fait pas</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="bg-canvas p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-xl" aria-hidden="true">
                    {feature.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-ink-muted">{feature.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stack technique */}
        <section id="sous-le-capot" className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Sous le capot</h2>
              <p className="mt-4 text-ink-muted">
                Une application full-stack conçue comme en entreprise : API REST documentée, architecture en couches, tests
                d'intégration sur une vraie base PostgreSQL et déploiement continu.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ink-muted">
                <li>✓ Authentification JWT sans état et données cloisonnées par utilisateur</li>
                <li>✓ Historique des statuts pour des statistiques exactes</li>
                <li>✓ Relances planifiées côté serveur et envoyées par e-mail</li>
                <li>✓ Démarrage de l'API accéléré de 2,6× grâce à une archive CDS</li>
              </ul>
              <a href={REPO_URL} className={`mt-8 ${buttonClass('secondary')}`}>
                Voir le code sur GitHub →
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STACK.map(({ area, items }) => (
                <Card key={area} className="p-5">
                  <h3 className="text-xs font-semibold tracking-wide text-ink-faint uppercase">{area}</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <li key={item} className="rounded-lg bg-surface-muted px-2 py-1 text-xs font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dernier appel à l'action */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="rounded-3xl bg-brand px-6 py-14 text-center text-on-brand">
            <h2 className="text-3xl font-bold tracking-tight">Prêt à reprendre la main sur ta recherche ?</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Crée ton compte en 30 secondes, ou explore la démo déjà remplie.</p>
            <div className="mt-8 flex justify-center">
              <Link to={user ? '/app' : '/register'} className="rounded-xl bg-on-brand px-5 py-3 font-semibold text-brand hover:opacity-90">
                {user ? 'Ouvrir mon tableau' : 'Commencer gratuitement'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink-faint sm:flex-row">
          <Logo className="text-ink" />
          <p>
            Conçu et développé par{' '}
            <a href="https://github.com/Walidee27" className="font-medium text-ink-muted hover:text-ink">
              Walide Ghazanfar
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
