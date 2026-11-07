import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { OnboardingPage } from '../presentation/pages/OnboardingPage'

/** URL paths owned by the onboarding module. */
export const onboardingRoutePaths = {
  home: '/',
}

/** Creates the public landing route with brand values supplied by the app. */
export function createOnboardingRoutes(brand: { brandName: string; brandMark: string; languageSwitcher: ReactNode }): RouteObject[] {
  return [{
    path: onboardingRoutePaths.home,
    element: <OnboardingPage brandName={brand.brandName} brandMark={brand.brandMark} languageSwitcher={brand.languageSwitcher} />,
  }]
}
