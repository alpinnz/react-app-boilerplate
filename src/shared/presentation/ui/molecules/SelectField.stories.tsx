import type { Meta, StoryObj } from '@storybook/react-vite'
import { SelectField } from './SelectField'

const options = <><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Administrator</option></>

const meta = {
  title: 'Shared UI/Molecules/Compatibility/SelectField',
  component: SelectField,
  args: { id: 'legacy-role', label: 'Role', defaultValue: 'viewer', children: options },
  argTypes: { children: { control: false } },
  parameters: { docs: { description: { component: 'Compatibility composition for existing consumers. New forms should use GroupForm with InputSelect.' } } },
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithHintAndError: Story = { args: { hint: 'Choose the least access this person needs.', error: 'Select a role.', defaultValue: '' } }
