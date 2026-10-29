import { useContext, useEffect, useState } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { GetHealth } from '../../domain/usecases/get-health.usecase'
import { HealthContext } from '../state/health.context'
import { createHealthStore } from '../state/health.store'

function HealthView() {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const store = useContext(HealthContext)
  if (!store) throw new Error('HealthProvider belum dipasang.')
  const health = useStore(store, (state) => state.health)
  const load = useStore(store, (state) => state.load)
  return <Surface className="w-full max-w-xl">
    <h1 className="text-page-title font-semibold tracking-tight">{translate('health.serviceStatus')}</h1>
    <p className="mt-2 text-sm text-content-muted">{translate('health.serviceDescription')}</p>
    <div className="mt-6 grid gap-4">
      {(health.status.type === 'initial' || health.status.type === 'loading') && <InlineFeedback tone="info">{translate('health.loadingStatus')}</InlineFeedback>}
      {health.status.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(health.status.failure.message)}</InlineFeedback>}
      {health.data && <InlineFeedback tone={health.data.api === 'ok' && health.data.database === 'ok' ? 'success' : 'error'}>
        {format('health.serviceSummary', { api: translate(health.data.api === 'ok' ? 'health.available' : 'health.unavailable'), database: translate(health.data.database === 'ok' ? 'health.available' : 'health.unavailable') })}
      </InlineFeedback>}
      <Button type="button" disabled={health.status.type === 'loading'} onClick={() => void load()}>{translate('health.refreshStatus')}</Button>
      <Link className="text-center text-sm font-semibold text-action underline" to="/login">{translate('common.backToLogin')}</Link>
    </div>
  </Surface>
}

/** Renders API and database availability with a retry action. */
export function HealthPage({ getHealth }: { getHealth: GetHealth }) {
  const [store] = useState(() => createHealthStore(getHealth))
  useEffect(() => { void store.getState().load(); return () => store.getState().cancelPending() }, [store])
  return <HealthContext.Provider value={store}><HealthView /></HealthContext.Provider>
}
