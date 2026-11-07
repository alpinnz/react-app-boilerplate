import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from '../molecules/GroupForm'
import { InputNumber } from './InputNumber'

const meta = {
  title: 'Shared UI/Atoms/InputNumber',
  component: InputNumber,
  args: { name: 'level', min: 1, max: 5, placeholder: '1–5' },
  render: (args) => <div className="max-w-sm p-6"><GroupForm controlId="story-level" labelText="Permission level" hintText="Choose a level from 1 to 5."><InputNumber {...args} /></GroupForm></div>,
  parameters: { docs: { description: { component: 'Numeric input for values where native number stepping and range validation are useful.' } } },
} satisfies Meta<typeof InputNumber>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const InvalidRange: Story = { args: { defaultValue: 8 }, render: (args) => <div className="max-w-sm p-6"><GroupForm controlId="story-level-invalid" labelText="Permission level" errorText="Select a value from 1 to 5."><InputNumber {...args} /></GroupForm></div> }
