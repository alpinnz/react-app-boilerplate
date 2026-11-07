import type { ReactNode } from 'react'
import { Breadcrumbs, type BreadcrumbEntry } from './Breadcrumbs'

type PageBreadcrumbs = {
  ariaLabel: string
  items: readonly BreadcrumbEntry[]
}

type PageHeadingProps = {
  title: string
  breadcrumbs?: PageBreadcrumbs
  description?: string
  eyebrow?: string
  actions?: ReactNode
  level?: 'page' | 'section'
  titleSize?: 'default' | 'compact'
  tone?: 'default' | 'danger'
}

/** Heading responsif untuk halaman dan section dengan slot tindakan opsional. */
export function PageHeading({ title, breadcrumbs, description, eyebrow, actions, level = 'page', titleSize = 'default', tone = 'default' }: PageHeadingProps) {
  const Heading = level === 'page' ? 'h1' : 'h2'
  const toneClass = tone === 'danger' ? 'text-danger' : 'text-content'
  const titleSizeClass = titleSize === 'compact' || level === 'section' ? 'text-app-subtitle-semi-bold' : 'text-app-title-semi-bold'

  return (
    <header className="grid gap-y-section">
      {breadcrumbs && <Breadcrumbs ariaLabel={breadcrumbs.ariaLabel} items={breadcrumbs.items} currentLabel={title} />}
      <div className="flex flex-col gap-section md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="text-app-label-medium text-content-muted">{eyebrow}</p>}
          <Heading className={titleSizeClass + ' ' + toneClass + (eyebrow ? ' mt-1' : '')}>
            {title}
          </Heading>
          {description && <p className="mt-field max-w-3xl text-app-body-regular-regular text-content-muted">{description}</p>}
        </div>
        {actions && <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 md:w-auto">{actions}</div>}
      </div>
    </header>
  )
}
