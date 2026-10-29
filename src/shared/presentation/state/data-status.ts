/** Tahapan pemuatan data yang dapat ditampilkan oleh lapisan presentation. */
export type DataStatus<Failure> =
  | { type: 'initial' }
  | { type: 'loading' }
  | { type: 'loadMore' }
  | { type: 'refreshing' }
  | { type: 'success' }
  | { type: 'noData' }
  | { type: 'failure'; failure: Failure }
