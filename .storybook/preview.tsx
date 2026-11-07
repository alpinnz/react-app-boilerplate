import type { Preview } from '@storybook/react-vite'
import { LocalizationProvider } from '@valfuse-node/react'
import { MINIMAL_VIEWPORTS } from 'storybook/viewport'
import localization from '../src/app/localization/generated/localization.manifest.json'
import { localeStorage } from '../src/app/localization/locale'
import { ToastProvider } from '../src/shared/presentation/ui/organisms/ToastProvider'
import '../src/app/styles/globals.css'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <LocalizationProvider manifest={localization} storage={localeStorage} initialLocale="id">
        <ToastProvider>
          <div className="min-h-dvh bg-canvas text-content">
            <Story />
          </div>
        </ToastProvider>
      </LocalizationProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true, sort: 'requiredFirst' },
    viewport: { options: MINIMAL_VIEWPORTS },
    options: {
      storySort: {
        order: [
          'Getting Started',
          'Shared UI', ['Atoms', 'Molecules', 'Organisms', 'Patterns'],
          'Application', ['Localization', 'Shell', 'Templates'],
          'Feature Modules',
        ],
      },
    },
  },
  initialGlobals: {
    viewport: { value: 'desktop', isRotated: false },
  },
}

export default preview
