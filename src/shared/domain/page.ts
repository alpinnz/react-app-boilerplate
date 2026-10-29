/** Halaman data hasil pagination berbasis cursor. */
export type Page<Item> = {
  items: Item[]
  nextCursor: string | null
}
