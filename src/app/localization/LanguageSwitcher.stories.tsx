import type { Meta, StoryObj } from '@storybook/react-vite'
import { LanguageSwitcher } from './LanguageSwitcher'

const meta = {
  title: 'Application/Localization/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: { docs: { description: { component: 'Application localization control. It uses the global Storybook localization provider and persists the selected locale.' } } },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const CompactMenu: Story = { args: { variant: 'menu' } }
export const Segmented: Story = { args: { variant: 'segmented' }, render: (args) => <div className="max-w-sm p-6"><LanguageSwitcher {...args} /></div> }
