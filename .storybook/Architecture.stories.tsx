import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../src/shared/presentation/ui/atoms/Button'
import { Surface } from '../src/shared/presentation/ui/atoms/Surface'

function ArchitectureGuide() {
  const layers = [
    {
      title: 'Atoms',
      path: 'shared/presentation/ui/atoms',
      description: 'Focused controls and surfaces: Button, InputPassword, InputSearch, InputSelect, and Surface.',
    },
    {
      title: 'Molecules',
      path: 'shared/presentation/ui/molecules',
      description: 'Small compositions with one job: GroupForm, InputPhoneNumber, PageHeading, and InlineFeedback.',
    },
    {
      title: 'Organisms',
      path: 'shared/presentation/ui/organisms',
      description: 'Complete interactions and data display: navigation, dialogs, tables, toast, and pull-to-refresh.',
    },
    {
      title: 'Patterns',
      path: 'shared/presentation/ui/patterns',
      description: 'Reusable page-level arrangements such as AsyncActionPattern.',
    },
  ]

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-8">
      <header className="grid gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-action">Developer guide</p>
        <h1 className="text-3xl font-semibold tracking-tight text-content">Component catalog</h1>
        <p className="max-w-3xl leading-relaxed text-content-muted">
          Explore shared UI by architecture layer. Each component page documents its purpose, states, controls, and responsive preview.
        </p>
      </header>

      <section aria-label="Shared UI architecture" className="grid gap-3 sm:grid-cols-2">
        {layers.map((layer) => (
          <Surface key={layer.title} className="grid content-start gap-2">
            <h2 className="text-lg font-semibold text-content">{layer.title}</h2>
            <code className="w-fit rounded-control bg-canvas px-2 py-1 text-xs text-action">{layer.path}</code>
            <p className="text-sm leading-relaxed text-content-muted">{layer.description}</p>
          </Surface>
        ))}
      </section>

      <Surface className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold text-content">Components outside shared UI</h2>
          <p className="mt-1 text-sm leading-relaxed text-content-muted">
            Application adapters live in <code>src/app/shell</code>, page frames in <code>src/app/templates</code>, and language controls in <code>src/app/localization</code>. Domain-aware views and dialogs live inside <code>src/modules/*/presentation</code> and are documented with their feature when they need isolated review.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary">Example control</Button>
          <Button type="button">Story controls are interactive</Button>
        </div>
      </Surface>

      <Surface>
        <h2 className="text-lg font-semibold text-content">Adding a story</h2>
        <ol className="mt-2 grid list-inside list-decimal gap-1.5 text-sm leading-relaxed text-content-muted">
          <li>Keep the story beside its component and title it with the matching architecture layer.</li>
          <li>Show the default case plus meaningful states such as disabled, invalid, empty, loading, or open.</li>
          <li>Use project tokens and real shared compositions; do not copy component styling into a story.</li>
          <li>Use the viewport toolbar and accessibility panel to review responsive behavior and semantics.</li>
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-content-muted">
          Contexts, hooks, validation helpers, and country data under the shared UI folders support components but have no independent visual story.
        </p>
      </Surface>
    </main>
  )
}

const meta = {
  title: 'Getting Started/Architecture',
  component: ArchitectureGuide,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ArchitectureGuide>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
