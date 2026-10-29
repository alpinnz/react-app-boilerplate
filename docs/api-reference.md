# Referensi API TypeScript

Dokumentasi HTML ini dibuat dari public API setiap modul dengan TypeDoc. Entrypoint modul adalah `src/modules/<module>/index.ts`; implementasi internal tidak menjadi API lintas modul.

Menu dokumentasi juga memuat [peta struktur proyek](project-structure.md), termasuk seluruh direktori source dan tanggung jawab layer.

## Gaya komentar

Gunakan TSDoc (`/** ... */`) pada simbol yang memang menjadi kontrak publik. Komentar menjelaskan tujuan, aturan yang tidak tampak dari signature, dan konsekuensi bagi pemanggil. Jangan menambahkan komentar baris demi baris yang hanya mengulang kode.

Dokumentasikan parameter dan hasil operasi dengan `@param` dan `@returns`. Gunakan `@remarks` untuk batasan penting serta `@example` hanya bila contoh memperjelas pemakaian. Komentar internal menjelaskan alasan atau invariant, bukan narasi langkah kode.

Contoh:

```ts
/**
 * Loads the current user's profile.
 *
 * @param signal - Optional cancellation signal for the request.
 * @returns The profile or a typed operation failure.
 */
export function getProfile(signal?: AbortSignal) {
  // ...
}
```

Jalankan `npm run docs:api` untuk menghasilkan `docs/api-reference/index.html`. Ringkasan TSDoc pada entry point ditampilkan bersama signature TypeScript di halaman HTML.
