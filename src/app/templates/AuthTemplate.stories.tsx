import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { InputEmail } from '@/shared/presentation/ui/atoms/InputEmail'
import { InputPassword } from '@/shared/presentation/ui/atoms/InputPassword'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { AuthTemplate } from './AuthTemplate'

function RegistrationPreview() {
  return <AuthTemplate>
    <PageHeading title="Create an account" description="Set up your workspace access." titleSize="compact" />
    <form className="mt-6 grid gap-3" onSubmit={(event) => event.preventDefault()}>
      <GroupForm controlId="storybook-auth-email" labelText="Email address"><InputEmail placeholder="name@example.com" autoComplete="email" /></GroupForm>
      <GroupForm controlId="storybook-auth-password" labelText="Password" hintText="Use at least 8 characters."><InputPassword placeholder="Create a password" autoComplete="new-password" /></GroupForm>
      <Button type="submit">Create account</Button>
    </form>
  </AuthTemplate>
}

const meta = {
  title: 'Application/Templates/AuthTemplate',
  component: RegistrationPreview,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Public authentication frame. The actual login and registration routes remain in the auth module.' } },
  },
} satisfies Meta<typeof RegistrationPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Registration: Story = {}
