import { describe, expect, it, vi } from 'vitest'
import type { GetHealth } from '../../domain/usecases/get-health.usecase'
import { createHealthStore } from './health.store'

describe('health store', () => {
  it('given a pending health check, when loading succeeds, then transitions from loading to success', async () => {
    const getHealth = vi.fn<GetHealth>().mockResolvedValue({ ok: true, data: { api: 'ok', database: 'ok' } })
    const store = createHealthStore(getHealth)
    const loading = store.getState().load()

    expect(store.getState().health.status.type).toBe('loading')
    await loading

    expect(store.getState().health).toEqual({ data: { api: 'ok', database: 'ok' }, status: { type: 'success' } })
  })

  it('given existing health data, when a refresh fails, then keeps the data and exposes the failure', async () => {
    const getHealth = vi.fn<GetHealth>()
      .mockResolvedValueOnce({ ok: true, data: { api: 'ok', database: 'ok' } })
      .mockResolvedValueOnce({ ok: false, failure: { kind: 'network', message: 'Server tidak tersedia.' } })
    const store = createHealthStore(getHealth)
    await store.getState().load()

    await store.getState().load()

    expect(store.getState().health).toEqual({
      data: { api: 'ok', database: 'ok' }, status: { type: 'failure', failure: { kind: 'network', message: 'Server tidak tersedia.' } },
    })
  })
})
