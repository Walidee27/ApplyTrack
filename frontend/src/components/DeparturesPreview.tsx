interface Departure {
  sent: string
  company: string
  title: string
  city: string
  status: string
  tone: 'offer' | 'interview' | 'delayed' | 'delayed-outline' | 'on-time' | 'cancelled'
}

const DEPARTURES: Departure[] = [
  { sent: '28/07', company: 'Société Générale', title: 'Alternant Java', city: 'La Défense', status: 'Décollé · Offre', tone: 'offer' },
  { sent: '16/09', company: 'Qonto', title: 'Full-stack', city: 'Paris', status: 'Embarquement · Entretien', tone: 'interview' },
  { sent: '07/09', company: 'BNP Paribas', title: 'Développeur web', city: 'Paris', status: 'Retardé 18 j · Relancer', tone: 'delayed' },
  { sent: '14/09', company: 'Leboncoin', title: 'React', city: 'Paris', status: 'Retardé 11 j · Relancer', tone: 'delayed-outline' },
  { sent: '24/09', company: 'Ubisoft', title: 'Outils internes', city: 'Montreuil', status: "À l'heure · Envoyée", tone: 'on-time' },
  { sent: '05/08', company: 'Thales', title: 'Full-stack', city: 'Vélizy', status: 'Annulé · Refus', tone: 'cancelled' },
]

const TONES: Record<Departure['tone'], string> = {
  offer: 'bg-status-offer text-on-brand',
  interview: 'bg-status-interview text-on-brand',
  delayed: 'bg-brand text-on-brand',
  'delayed-outline': 'border border-brand text-brand',
  'on-time': 'border border-line-strong text-ink-muted',
  cancelled: 'border border-line-strong text-ink-faint',
}

/** Tableau des départs de la page d'accueil : un exemple statique, dans le style de l'application. */
export function DeparturesPreview() {
  return (
    <div className="overflow-hidden border border-line bg-surface">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Exemple de tableau de candidatures</caption>
        <thead>
          <tr className="board-label text-[11px] text-ink-faint">
            <th scope="col" className="hidden px-6 py-4 font-normal sm:table-cell">Envoi</th>
            <th scope="col" className="px-4 py-4 font-normal sm:px-6">Destination</th>
            <th scope="col" className="hidden px-6 py-4 font-normal md:table-cell">Poste</th>
            <th scope="col" className="hidden px-6 py-4 font-normal lg:table-cell">Ville</th>
            <th scope="col" className="px-4 py-4 font-normal sm:px-6">Statut</th>
          </tr>
        </thead>
        <tbody className="font-mono text-sm sm:text-base">
          {DEPARTURES.map((d) => {
            const cancelled = d.tone === 'cancelled'
            return (
              <tr
                key={d.company}
                className={`border-t border-line ${d.tone === 'delayed' ? 'bg-brand-soft' : ''} ${cancelled ? 'text-ink-faint' : ''}`}
              >
                <td className="hidden px-6 py-4 text-ink-faint sm:table-cell">{d.sent}</td>
                <td className="px-4 py-4 sm:px-6">
                  <span
                    className={`font-sans text-xl font-extrabold uppercase sm:text-2xl ${cancelled ? 'line-through' : ''}`}
                    style={{ fontStretch: '75%' }}
                  >
                    {d.company}
                  </span>
                </td>
                <td className="hidden px-6 py-4 md:table-cell">{d.title}</td>
                <td className="hidden px-6 py-4 lg:table-cell">{d.city}</td>
                <td className="px-4 py-4 sm:px-6">
                  <span className={`inline-block px-2.5 py-1.5 text-[11px] font-bold tracking-wider uppercase sm:text-xs ${TONES[d.tone]}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
