import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './IconButton'

const searchIcon = <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>

const meta = {
  title: 'Shared UI/Atoms/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Search', children: searchIcon },
  parameters: {
    docs: { description: { component: 'Accessible icon-only actions composed from the shared Button atom and semantic design tokens.' } },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {}
export const NeutralBordered: Story = { args: { variant: 'neutral-bordered' } }
export const Primary: Story = { args: { variant: 'primary' } }
export const Small: Story = { args: { size: 'small' } }
export const Disabled: Story = { args: { disabled: true } }
