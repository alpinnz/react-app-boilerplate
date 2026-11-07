import type { ReactNode } from 'react'

/** One ancestor in a breadcrumb trail. The caller owns its navigation behavior. */
export type BreadcrumbEntry = {
  id: string
  content: ReactNode
  hideBelowSm?: boolean
}

type BreadcrumbsProps = {
  ariaLabel: string
  items: readonly BreadcrumbEntry[]
  currentLabel: string
}

/** Renders a semantic breadcrumb list with a current-page segment. */
export function Breadcrumbs({ ariaLabel, items, currentLabel }: BreadcrumbsProps) {
  return <nav aria-label={ariaLabel} className="min-w-0">
    <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-app-body-regular-regular">
      {items.map((item) => <li
        key={item.id}
        className={`flex min-w-0 shrink items-center gap-1.5 ${item.hideBelowSm ? 'hidden sm:flex' : ''}`}
      >
        <span className="min-w-0 truncate text-app-hyperlink-regular-regular text-content-muted">{item.content}</span>
        <span aria-hidden="true" className="shrink-0 text-content-muted">/</span>
      </li>)}
      <li aria-current="page" className="min-w-0 truncate text-app-body-regular-medium text-content">{currentLabel}</li>
    </ol>
  </nav>
}
