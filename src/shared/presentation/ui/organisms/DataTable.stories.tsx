import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type DataTableColumn } from './DataTable'

type ExampleUser = { id: string; name: string; email: string; level: number }

const users: ExampleUser[] = [
  { id: '1', name: 'Ari Pratama', email: 'ari@example.test', level: 3 },
  { id: '2', name: 'Maya Chen', email: 'maya@example.test', level: 2 },
  { id: '3', name: 'Sam Rivera', email: 'sam@example.test', level: 1 },
]

const columns: DataTableColumn<ExampleUser>[] = [
  { id: 'name', label: 'Name', sortValue: (user) => user.name, pin: 'start', render: (user) => <strong>{user.name}</strong> },
  { id: 'email', label: 'Email', sortValue: (user) => user.email, render: (user) => <span className="text-content-muted">{user.email}</span> },
  { id: 'level', label: 'Access level', sortValue: (user) => user.level, render: (user) => user.level },
]

function DataTableExamples() {
  return <div className="grid gap-6 p-4 sm:p-6">
    <section className="grid gap-2"><h2 className="text-app-subtitle-semi-bold">Sortable table</h2><DataTable label="Example users" columns={columns} rows={users} rowKey={(user) => user.id} emptyTitle="No users found" /></section>
    <section className="grid gap-2"><h2 className="text-app-subtitle-semi-bold">Loading state</h2><DataTable label="Loading users" columns={columns} rows={[]} rowKey={(user) => user.id} emptyTitle="No users found" isLoading loadingRowCount={3} /></section>
    <section className="grid gap-2"><h2 className="text-app-subtitle-semi-bold">Empty state</h2><DataTable label="Filtered users" columns={columns} rows={[]} rowKey={(user) => user.id} emptyTitle="No matching users" emptyDescription="Try a different name or email." /></section>
  </div>
}

const meta = {
  title: 'Shared UI/Organisms/DataTable',
  component: DataTableExamples,
  parameters: { docs: { description: { component: 'Responsive table with local sorting, pinned identity/action columns, loading, empty, and optional mobile-row states.' } } },
} satisfies Meta<typeof DataTableExamples>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {}
