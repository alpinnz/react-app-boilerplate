import type { Meta, StoryObj } from '@storybook/react-vite'
import { InputEmail } from '../atoms/InputEmail'
import { GroupForm } from './GroupForm'

const meta = {
  title: 'Shared UI/Molecules/GroupForm',
  component: GroupForm,
  args: { controlId: 'contact-email', labelText: 'Email address', children: <InputEmail placeholder="name@example.com" /> },
  argTypes: { children: { control: false } },
  render: (args) => <div className="max-w-md p-6"><GroupForm {...args} /></div>,
  parameters: { docs: { description: { component: 'Owns a field label, hint, and error. Place exactly one semantic Input* child inside it.' } } },
} satisfies Meta<typeof GroupForm>

export default meta
type Story = StoryObj<typeof meta>

export const LabelAndControl: Story = {}
export const WithHint: Story = { args: { hintText: 'Use an address you can access.' } }
export const WithError: Story = { args: { errorText: 'Enter a valid email address.' } }
export const ScreenReaderLabel: Story = { args: { labelVisibility: 'sr-only', children: <InputEmail placeholder="name@example.com" /> } }
