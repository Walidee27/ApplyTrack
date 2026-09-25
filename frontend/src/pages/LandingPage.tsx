import { Link } from 'react-router'
import { ApiError } from '../api/client'
import { DEMO_ENABLED, useDemoLogin } from '../auth/useDemoLogin'
import { useAuth } from '../auth/useAuth'
import { DeparturesPreview } from '../components/DeparturesPreview'
import { ButtonLink, Logo, Spinner } from '../components/ui'
import { buttonClass } from '../lib/button'

const REPO_URL = 'https://github.com/Walidee27/ApplyTrack'

const GATES = [
  {
    gate: 'Porte 01',
    title: 'Suivi en temps réel',
    text: "Envoyée, relancée, entretien, offre : fais glisser chaque candidature jusqu'à l'étape suivante.",
  },
  {
    gate: 'Porte 02',
    title: 'Annonce des retards',
    text: 'Chaque matin à 8 h, un e-mail liste les candidatures sans nouvelles depuis trop longtemps.',
  },
  {
    gate: 'Porte 03',
    title: 'Bilan de vol',
    text: "Taux de réponse, taux d'entretien et délai moyen avant la première réponse.",
  },
]

const MANIFEST = [
  ['Front-end', 'React 19 · TypeScript · TanStack Query · Tailwind CSS 4 · dnd-kit'],
  ['Back-end', 'Java 21 · Spring Boot 3 · Spring Security (JWT) · JPA · Flyway'],
  ['Qualité', 'JUnit 5 · Testcontainers · Vitest · GitHub Actions'],
  ['Infra', 'Docker · PostgreSQL (Neon) · Render · Vercel'],
  ['Démarrage', 'API 2,6× plus rapide grâce à une archive CDS'],
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
          <Spinner /> Embarquement…
        </>
      ) : (
        'Embarquer sur la démo →'
      )}
    </button>
  ) : (
    <ButtonLink to="/register" size="lg">
      Créer un compte
    </ButtonLink>
  )

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[90rem] items-center gap-6 px-4 py-4 sm:px-10">
          <Link to="/" aria-label="ApplyTrack, accueil">
            <Logo />
          </Link>
          <nav className="hidden gap-7 font-mono text-xs tracking-wider uppercase md:flex" aria-label="Sections">
            <a href="#portes" className="hover:text-brand">Fonctionnalités</a>
            <a href="#manifeste" className="hover:text-brand">Sous le capot</a>
            <a href={REPO_URL} className="hover:text-brand">GitHub</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <ButtonLink to="/app" variant="outline">Mon tableau</ButtonLink>
            ) : (
              <ButtonLink to="/login" variant="outline">Connexion</ButtonLink>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[90rem] px-4 pt-14 pb-12 sm:px-10 sm:pt-20">
          <p className="board-label text-brand">Terminal stage &amp; alternance</p>
          <h1 className="mt-5 board-title text-[4.5rem] sm:text-[7rem] lg:text-[9.5rem]">
            Tes candidatures,
            <br />
            <span className="text-brand">à l'heure.</span>
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end">
            <p className="max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              Chaque candidature est un vol : tu suis son statut en temps réel, et ApplyTrack t'annonce les retards avant que
              tu ne les oublies.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
              {primaryCta}
              {!user && (
                <ButtonLink to="/register" variant="secondary" size="lg">
                  Créer un compte
                </ButtonLink>
              )}
            </div>
          </div>
          {demoError && (
            <p role="alert" className="mt-4 font-mono text-sm text-danger">
              {demoError}
            </p>
          )}
          {DEMO_ENABLED && !user && (
            <p className="mt-4 font-mono text-xs text-ink-faint lg:text-right">
              Sans inscription · données fictives réinitialisées chaque nuit
            </p>
          )}
        </section>

        <section className="mx-auto max-w-[90rem] px-4 sm:px-10" aria-label="Aperçu">
          <DeparturesPreview />
        </section>

        <section id="portes" className="mx-auto mt-16 max-w-[90rem] px-4 sm:px-10">
          <div className="grid border-t border-line md:grid-cols-3">
            {GATES.map((g, index) => (
              <div
                key={g.gate}
                className={`py-10 md:px-10 ${index === 0 ? 'md:pl-0' : ''} ${index < GATES.length - 1 ? 'border-b border-line md:border-r md:border-b-0' : ''} ${index === GATES.length - 1 ? 'md:pr-0' : ''}`}
              >
                <p className="board-label text-brand">{g.gate}</p>
                <h2 className="mt-3 text-4xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
                  {g.title}
                </h2>
                <p className="mt-3 leading-relaxed text-ink-muted">{g.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="manifeste" className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-16 sm:px-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="board-label text-ink-faint">Manifeste technique</p>
              <h2 className="mt-3 board-title text-6xl">Sous le capot</h2>
              <p className="mt-5 max-w-md leading-relaxed text-ink-muted">
                Une application full-stack conçue comme en entreprise : API REST documentée, architecture en couches, tests
                d'intégration sur une vraie base PostgreSQL et déploiement continu.
              </p>
              <a href={REPO_URL} className={`mt-8 ${buttonClass('secondary')}`}>
                Code source →
              </a>
            </div>
            <dl className="border-t border-line-strong font-mono text-sm">
              {MANIFEST.map(([area, items]) => (
                <div key={area} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr]">
                  <dt className="tracking-wider text-brand uppercase">{area}</dt>
                  <dd className="text-ink-muted">{items}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-10">
          <div className="flex flex-col gap-8 bg-brand px-6 py-12 text-on-brand sm:px-12 lg:flex-row lg:items-center">
            <h2 className="board-title text-5xl sm:text-6xl">Prêt au décollage ?</h2>
            <Link
              to={user ? '/app' : '/register'}
              className="bg-on-brand px-6 py-4 font-mono text-sm font-bold tracking-wider text-brand uppercase hover:opacity-90 lg:ml-auto"
            >
              {user ? 'Ouvrir mon tableau →' : 'Créer mon compte gratuit →'}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-4 py-8 font-mono text-xs tracking-wider text-ink-faint uppercase sm:flex-row sm:px-10">
          <span>ApplyTrack · React · Spring Boot · PostgreSQL</span>
          <span>
            Conçu par{' '}
            <a href="https://github.com/Walidee27" className="text-ink-muted hover:text-brand">
              Walide Ghazanfar
            </a>
          </span>
          <a href={REPO_URL} className="font-bold text-ink-muted hover:text-brand sm:ml-auto">
            Code source →
          </a>
        </div>
      </footer>
    </div>
  )
}
