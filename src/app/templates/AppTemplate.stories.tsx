import { createStore } from 'zustand/vanilla'
import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SessionContext, type SessionStore } from '@/modules/auth'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { AppTemplate } from './AppTemplate'

const sessionStore = createStore<SessionStore>()(() => ({
  session: {
    data: { userId: 'storybook-user', name: 'Alex Morgan', email: 'alex@example.test', role: { name: 'owner', level: 5 } },
    status: { type: 'success' },
  },
  login: async () => true,
  logout: async () => null,
  invalidate: () => undefined,
  rename: () => undefined,
  cancelPending: () => undefined,
}))

function DashboardPreview() {
  return <SessionContext.Provider value={sessionStore}>
    <MemoryRouter initialEntries={['/users']}>
      <AppTemplate>
        <div className="grid gap-4">
          <PageHeading title="User list" description="Review workspace accounts and access." actions={<Button type="button">Add user</Button>} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Surface><p className="text-app-body-regular-regular text-content-muted">Active users</p><p className="mt-2 text-app-display-4-semi-bold">128</p></Surface>
            <Surface><p className="text-app-body-regular-regular text-content-muted">Pending invitations</p><p className="mt-2 text-app-display-4-semi-bold">6</p></Surface>
          </div>
          <Surface><h2 className="text-app-subtitle-semi-bold">Recent activity</h2><p className="mt-2 text-app-body-regular-regular text-content-muted">New members and permission changes appear here.</p></Surface>
        </div>
      </AppTemplate>
    </MemoryRouter>
  </SessionContext.Provider>
}

const meta = {
  title: 'Application/Shell/AppTemplate',
  component: DashboardPreview,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Authenticated application shell with top navigation, responsive sidebar, fluid content, and footer. This story supplies an in-memory demo session.' } },
  },
} satisfies Meta<typeof DashboardPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Dashboard: Story = {}
