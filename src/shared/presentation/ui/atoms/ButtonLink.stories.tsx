import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ButtonLink } from './ButtonLink'

const meta = {
  title: 'Shared UI/Atoms/ButtonLink',
  component: ButtonLink,
  args: { to: '/login', children: 'Continue to sign in' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: {
    docs: { description: { component: 'Navigation link styled with the shared Button hierarchy while preserving anchor semantics.' } },
  },
} satisfies Meta<typeof ButtonLink>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary', children: 'Skip' } }
export const Tertiary: Story = { args: { variant: 'tertiary', children: 'View details' } }
