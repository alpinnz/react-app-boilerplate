import type { DataStatus } from './data-status'

/** Pasangan data dan statusnya agar UI memiliki satu sumber state pemuatan. */
export type DataState<Data, Failure> = {
  data: Data | null
  status: DataStatus<Failure>
}

/** Membuat state kosong sebelum operasi data dimulai. */
export function initialDataState<Data, Failure>(): DataState<Data, Failure> {
  return { data: null, status: { type: 'initial' } }
}
