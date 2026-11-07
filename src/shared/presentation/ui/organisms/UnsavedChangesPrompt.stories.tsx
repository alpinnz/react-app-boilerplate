import { useMemo } from 'react'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { UnsavedChangesPrompt } from './UnsavedChangesPrompt'

function FormRoute() {
  const navigate = useNavigate()
  return <div className="grid max-w-lg gap-4 p-6">
    <UnsavedChangesPrompt when />
    <h1 className="text-app-title-semi-bold">Edit profile</h1>
    <p className="text-app-body-regular-regular text-content-muted">Navigate away to see the confirmation prompt.</p>
    <Button type="button" onClick={() => navigate('/next')}>Open another page</Button>
  </div>
}

function NextRoute() {
  return <div className="p-6"><h1 className="text-app-title-semi-bold">Another page</h1></div>
}

function UnsavedChangesExample() {
  const router = useMemo(() => createMemoryRouter([
    { path: '/', element: <FormRoute /> },
    { path: '/next', element: <NextRoute /> },
  ]), [])
  return <RouterProvider router={router} />
}

const meta = {
  title: 'Shared UI/Organisms/UnsavedChangesPrompt',
  component: UnsavedChangesExample,
  parameters: { docs: { description: { component: 'Uses a data router blocker to confirm navigation when a form has unsaved changes.' } } },
} satisfies Meta<typeof UnsavedChangesExample>

export default meta
type Story = StoryObj<typeof meta>

export const NavigateAway: Story = {}
