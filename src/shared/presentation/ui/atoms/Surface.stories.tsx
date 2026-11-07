import type { Meta, StoryObj } from '@storybook/react-vite'
import { Surface } from './Surface'

function SurfaceExample() {
  return <div className="max-w-xl p-6"><Surface><h2 className="text-app-subtitle-semi-bold">Account details</h2><p className="mt-2 text-app-body-regular-regular text-content-muted">Surface groups related content with consistent border, radius, spacing, and elevation.</p></Surface></div>
}

const meta = {
  title: 'Shared UI/Atoms/Surface',
  component: SurfaceExample,
  parameters: { docs: { description: { component: 'Semantic content surface with responsive padding and the shared surface token.' } } },
} satisfies Meta<typeof SurfaceExample>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
