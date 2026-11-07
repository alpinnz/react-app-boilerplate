import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from '../molecules/GroupForm'
import { InputSearch } from './InputSearch'

const meta = {
  title: 'Shared UI/Atoms/InputSearch',
  component: InputSearch,
  args: { placeholder: 'Search by name or email' },
  render: (args) => <div className="max-w-lg p-6"><GroupForm controlId="story-search" labelText="Search users"><InputSearch {...args} /></GroupForm></div>,
  parameters: { docs: { description: { component: '40px search field with a built-in leading icon.' } } },
} satisfies Meta<typeof InputSearch>

export default meta
type Story = StoryObj<typeof meta>

export const Regular: Story = {}
export const Disabled: Story = { args: { disabled: true, placeholder: 'Search unavailable' } }
