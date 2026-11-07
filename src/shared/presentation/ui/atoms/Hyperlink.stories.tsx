import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Hyperlink } from './Hyperlink'

const meta = {
  title: 'Shared UI/Atoms/Hyperlink',
  component: Hyperlink,
  args: { to: '/users', children: 'View users' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: {
    docs: { description: { component: 'Inline route link with neutral/solid treatments, app hyperlink typography, and an optional trailing icon.' } },
  },
} satisfies Meta<typeof Hyperlink>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {}
export const Solid: Story = { args: { treatment: 'solid' } }
export const WithTrailingIcon: Story = {
  args: {
    treatment: 'solid',
    trailingIcon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5"><path d="M3 13 13 3m-7 0h7v7" /></svg>,
  },
}
