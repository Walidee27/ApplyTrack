import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApplicationForm } from './ApplicationForm'

describe('ApplicationForm', () => {
  it('envoie les champs facultatifs vides à null', async () => {
    const onSubmit = vi.fn()
    render(<ApplicationForm isSaving={false} onSubmit={onSubmit} onCancel={() => {}} />)

    await userEvent.type(screen.getByLabelText('Entreprise'), 'Acme')
    await userEvent.type(screen.getByLabelText('Poste'), 'Développeur Java')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        company: 'Acme',
        title: 'Développeur Java',
        status: 'APPLIED',
        location: null,
        jobUrl: null,
        notes: null,
      }),
    )
  })

  it('affiche les erreurs de validation renvoyées par le back', () => {
    render(
      <ApplicationForm
        isSaving={false}
        fieldErrors={{ company: 'ne doit pas être vide' }}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText('ne doit pas être vide')).toBeInTheDocument()
    expect(screen.getByLabelText(/Entreprise/)).toHaveAttribute('aria-invalid', 'true')
  })

  it("n'affiche le bouton Supprimer qu'en modification", () => {
    render(<ApplicationForm isSaving={false} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument()
  })
})
