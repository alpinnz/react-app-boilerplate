import { useState, type ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { assets } from '@/shared/assets/generated/assets'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { ButtonLink } from '@/shared/presentation/ui/atoms/ButtonLink'
import { IconButton } from '@/shared/presentation/ui/atoms/IconButton'
import { Hyperlink } from '@/shared/presentation/ui/atoms/Hyperlink'

const slides = [
  {
    titleKey: 'onboarding.welcomeTitle',
    descriptionKey: 'onboarding.welcomeDescription',
    illustrationSource: assets.onboarding.workspaceOverview,
    illustrationAltKey: 'onboarding.welcomeImageAlt',
  },
  {
    titleKey: 'onboarding.accountTitle',
    descriptionKey: 'onboarding.accountDescription',
    illustrationSource: assets.onboarding.accountManagement,
    illustrationAltKey: 'onboarding.accountImageAlt',
  },
  {
    titleKey: 'onboarding.accessTitle',
    descriptionKey: 'onboarding.accessDescription',
    illustrationSource: assets.onboarding.userAccess,
    illustrationAltKey: 'onboarding.accessImageAlt',
  },
  {
    titleKey: 'onboarding.statusTitle',
    descriptionKey: 'onboarding.statusDescription',
    illustrationSource: assets.onboarding.serviceHealth,
    illustrationAltKey: 'onboarding.statusImageAlt',
  },
] as const

function OnboardingIllustration({ source, alt }: { source: string; alt: string }) {
  return <img src={source} alt={alt} width={320} height={240} decoding="async" className="h-auto w-full max-w-[22rem] object-contain" />
}

/** Presents the app's account and access features through an accessible carousel. */
export function OnboardingPage({ brandName, brandMark, languageSwitcher }: { brandName: string; brandMark: string; languageSwitcher: ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const { translate, format } = useLocalization()
  const slide = slides[activeSlide]
  const slideTitle = activeSlide === 0
    ? format(slide.titleKey, { brandName })
    : translate(slide.titleKey)
  const slideAlt = translate(slide.illustrationAltKey)
  const isLastSlide = activeSlide === slides.length - 1

  return (
    <>
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-section">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-control bg-action text-app-subtitle-bold text-on-action">{brandMark}</span>
          <span className="min-w-0">
            <strong className="block truncate text-app-body-regular-bold text-content">{brandName}</strong>
            <span className="block text-app-caption-regular text-content-muted">{translate('app.workspaceTagline')}</span>
          </span>
        </div>
        {languageSwitcher}
      </header>

      <section className="relative mx-auto mt-section flex w-full max-w-6xl flex-col overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
          <div className="order-2 flex min-w-0 flex-col p-5 md:p-8 lg:order-1 lg:p-12">
            <p className="text-app-label-semi-bold text-action">{translate('app.workspace')}</p>
            <div className="mt-section flex-1" role="group" aria-roledescription={translate('onboarding.carousel')} aria-label={translate('onboarding.introduction')} aria-live="polite">
              <p className="text-app-body-small-semi-bold text-content-muted">{format('onboarding.slideCount', { current: activeSlide + 1, total: slides.length })}</p>
              <h1 className="mt-3 text-app-title-semi-bold text-content">{slideTitle}</h1>
              <p className="mt-form max-w-xl text-app-body-regular-regular text-content-muted">{translate(slide.descriptionKey)}</p>
            </div>
          </div>

          <div className="relative order-1 grid min-h-72 place-items-center overflow-hidden bg-canvas p-6 md:min-h-80 lg:order-2 lg:min-h-[28rem]">
            <div aria-hidden="true" className="absolute inset-6 rounded-surface border border-line bg-surface md:inset-8" />
            <div aria-live="off" className="relative z-10 grid min-h-64 w-full place-items-center">
              <OnboardingIllustration source={slide.illustrationSource} alt={slideAlt} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center border-t border-line bg-surface px-page-gutter py-4 md:py-5">
          <div className="flex items-center gap-0.5 md:gap-1" role="group" aria-label={translate('onboarding.slideNavigation')}>
            {slides.map((item, index) => (
              <IconButton
                key={item.titleKey}
                type="button"
                aria-label={format('onboarding.showSlide', { number: index + 1 })}
                aria-current={index === activeSlide ? 'step' : undefined}
                variant="neutral"
                onClick={() => setActiveSlide(index)}
                className="!shrink-0 !rounded-full hover:!bg-canvas"
              >
                <span aria-hidden="true" className={`size-2.5 rounded-full transition-colors ${index === activeSlide ? 'bg-action' : 'bg-line-strong hover:bg-content-muted'}`} />
              </IconButton>
            ))}
          </div>

          {!isLastSlide ? (
            <div className="mt-3 grid w-full max-w-sm grid-cols-2 gap-3">
              <ButtonLink to="/login" variant="neutral-bordered" className="w-full">
                {translate('onboarding.skip')}
              </ButtonLink>
              <Button type="button" onClick={() => setActiveSlide((current) => Math.min(current + 1, slides.length - 1))}>
                {translate('onboarding.next')}
              </Button>
            </div>
          ) : (
            <div className="mt-form grid w-full max-w-xl gap-form md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <ButtonLink to="/login" className="w-full !px-5">
                {translate('onboarding.login')}
              </ButtonLink>
              <p className="text-center text-app-body-small-regular text-content-muted md:text-right">
                {translate('onboarding.registerPrompt')}{' '}
                <Hyperlink to="/register" treatment="solid" className="!text-app-hyperlink-regular-semi-bold">{translate('onboarding.register')}</Hyperlink>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
