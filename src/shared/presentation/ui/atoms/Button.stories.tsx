import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'Shared UI/Atoms/Button',
  component: Button,
  args: { children: 'Save changes' },
  parameters: {
    docs: { description: { component: 'Semantic button variants, including a text-only tertiary action, that preserve native button attributes and keyboard behavior.' } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } }
export const Tertiary: Story = { args: { variant: 'tertiary', children: 'View details' } }
export const Neutral: Story = { args: { variant: 'neutral', children: 'Cancel' } }
export const NeutralBordered: Story = { args: { variant: 'neutral-bordered', children: 'Choose account' } }
export const Destructive: Story = { args: { variant: 'danger', children: 'Delete account' } }
export const Quiet: Story = { args: { variant: 'quiet', children: 'Remove' } }
export const Small: Story = { args: { size: 'small', children: 'Add' } }
export const Large: Story = { args: { size: 'large', children: 'Get started' } }
export const Disabled: Story = { args: { disabled: true } }
export const Loading: Story = { args: { loading: true, loadingLabel: 'Saving changes' } }
export const LoadingWithProgressLabel: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
    loading: true,
    loadingLabel: 'Loading more users',
    loadingPresentation: 'indicator-with-label',
    children: 'Load more users',
  },
}
