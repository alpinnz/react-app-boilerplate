import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta = {
  title: 'Shared UI/Atoms/Input',
  component: Input,
  args: { placeholder: 'Enter a value' },
  render: (args) => (
    <div className="max-w-md p-6">
      <label htmlFor="base-input" className="mb-2 block text-app-label-semi-bold">Base control</label>
      <Input {...args} id="base-input" />
    </div>
  ),
  parameters: {
    docs: { description: { component: 'Low-level native input styling. Prefer a semantic Input* component in forms so GroupForm validation and accessibility stay connected.' } },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Invalid: Story = { args: { 'aria-invalid': true, value: 'Invalid value' } }
export const Disabled: Story = { args: { disabled: true, placeholder: 'Unavailable' } }
