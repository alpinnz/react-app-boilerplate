import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from '../molecules/GroupForm'
import { InputSelect } from './InputSelect'

const options = <><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Administrator</option></>

const meta = {
  title: 'Shared UI/Atoms/InputSelect',
  component: InputSelect,
  args: { name: 'role', defaultValue: 'viewer', children: options },
  argTypes: { children: { control: false } },
  render: (args) => <div className="max-w-md p-6"><GroupForm controlId="story-role" labelText="Role"><InputSelect {...args}>{args.children}</InputSelect></GroupForm></div>,
  parameters: { docs: { description: { component: 'Native select control that inherits GroupForm validation and accessible descriptions.' } } },
} satisfies Meta<typeof InputSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Required: Story = { args: { required: true, defaultValue: '' } }
