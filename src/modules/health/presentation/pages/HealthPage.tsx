import { useContext, useEffect, useState } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Hyperlink } from '@/shared/presentation/ui/atoms/Hyperlink'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { useFailureToast } from '@/shared/presentation/ui/organisms/useToast'
import { PullToRefresh } from '@/shared/presentation/ui/organisms/PullToRefresh'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { GetHealth } from '../../domain/usecases/get-health.usecase'
import { HealthContext } from '../state/health.context'
import { createHealthStore } from '../state/health.store'

function HealthView({ showLoginLink }: { showLoginLink: boolean }) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const showFailureToast = useFailureToast()
  const contextStore = useContext(HealthContext)
  if (!contextStore) throw new Error('HealthProvider belum dipasang.')
  const store = contextStore
  const health = useStore(store, (state) => state.health)
  const load = useStore(store, (state) => state.load)
  async function refreshStatus() {
    await load()
    const status = store.getState().health.status
    if (status.type === 'failure') showFailureToast(status.failure.message)
  }
  return <div className="mx-auto w-full max-w-xl">
    <PullToRefresh
      onRefresh={refreshStatus}
      isRefreshing={health.status.type === 'refreshing'}
      disabled={health.status.type === 'loading'}
      pullLabel={translate('common.pullToRefresh')}
      releaseLabel={translate('common.releaseToRefresh')}
      refreshingLabel={translate('common.refreshing')}
    >
      {showLoginLink
        ? <PageHeading title={translate('health.serviceStatus')} description={translate('health.serviceDescription')} />
        : <p className="text-app-body-regular-regular text-content-muted">{translate('health.serviceDescription')}</p>}
      <div className="mt-form grid gap-form">
        {(health.status.type === 'initial' || health.status.type === 'loading') && <InlineFeedback tone="info">{translate('health.loadingStatus')}</InlineFeedback>}
        {health.status.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(health.status.failure.message)}</InlineFeedback>}
        {health.data && <InlineFeedback tone={health.data.api === 'ok' && health.data.database === 'ok' ? 'success' : 'error'}>
          {format('health.serviceSummary', { api: translate(health.data.api === 'ok' ? 'health.available' : 'health.unavailable'), database: translate(health.data.database === 'ok' ? 'health.available' : 'health.unavailable') })}
        </InlineFeedback>}
        {showLoginLink && <Hyperlink to="/login" treatment="solid" className="text-center !text-app-hyperlink-regular-semi-bold underline">{translate('common.backToLogin')}</Hyperlink>}
      </div>
    </PullToRefresh>
  </div>
}

/** Renders API and database availability with a retry action. */
export function HealthPage({ getHealth, showLoginLink = true }: { getHealth: GetHealth; showLoginLink?: boolean }) {
  const [store] = useState(() => createHealthStore(getHealth))
  useEffect(() => { void store.getState().load(); return () => store.getState().cancelPending() }, [store])
  return <HealthContext.Provider value={store}><HealthView showLoginLink={showLoginLink} /></HealthContext.Provider>
}
