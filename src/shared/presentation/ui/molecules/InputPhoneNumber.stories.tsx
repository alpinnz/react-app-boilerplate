import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from './GroupForm'
import { InputPhoneNumber } from './InputPhoneNumber'

const meta = {
  title: 'Shared UI/Molecules/InputPhoneNumber',
  component: InputPhoneNumber,
  args: {
    name: 'phone_number',
    countryCodeName: 'country_code',
    phoneNumber: '8123456789',
    countryCode: '+62',
    onPhoneNumberChange: () => undefined,
    onCountryCodeChange: () => undefined,
    placeholder: '812 3456 7890',
  },
  argTypes: { onPhoneNumberChange: { control: false }, onCountryCodeChange: { control: false } },
  render: (args) => <div className="max-w-lg p-6"><GroupForm controlId="phone-number" labelText="Phone number" hintText="Choose a country code, then enter the national number."><InputPhoneNumber {...args} /></GroupForm></div>,
  parameters: { docs: { description: { component: 'Phone field combining a searchable country picker and national-number input. Place inside GroupForm.' } } },
} satisfies Meta<typeof InputPhoneNumber>

export default meta
type Story = StoryObj<typeof meta>

export const Indonesia: Story = {}
export const Empty: Story = { args: { phoneNumber: '', countryCode: '' } }
export const Disabled: Story = { args: { disabled: true } }
