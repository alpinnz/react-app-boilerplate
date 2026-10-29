# React Clean Architecture + Zustand Context

SPA React 19 + TypeScript 7 dengan arsitektur modular berlapis dan alur `UI → Zustand action → use case → repository → data source → HTTP`; panduan struktur layer ada di [`docs/project-structure.md`](docs/project-structure.md). Pemetaan kontrak API yang dikonsumsi frontend ada di [`docs/api-coverage.md`](docs/api-coverage.md).

UI menggunakan Tailwind CSS v4 dengan token primitive dan semantic serta komposisi atom, molekul, organisme, pattern, dan template. Aturan kepemilikan dan pemakaian token ada di [`docs/design-system.md`](docs/design-system.md).

Peta lengkap direktori milik proyek dan klasifikasi tiap layer ada di [`docs/project-structure.md`](docs/project-structure.md). Dokumen ini juga dimasukkan ke HTML TypeDoc.

Aplikasi mencakup seluruh operasi kontrak untuk autentikasi, profil sendiri, pengguna, peran, dan status layanan. Pemetaan tiap endpoint ada di [`docs/api-coverage.md`](docs/api-coverage.md).

## Menjalankan

1. Jalankan backend Express di `http://localhost:3000` beserta database dan seed sesuai petunjuk repository backend. Konfigurasi CORS backend harus mengizinkan `http://localhost:5173`.
2. Salin `.env.example` ke `.env.local` bila URL API berbeda. `VITE_API_BASE_URL` adalah host tanpa `/api/v1`.
3. Jalankan `npm install`, lalu `npm run dev`. Buka `http://localhost:5173`.

Pengguna dapat mendaftar, mengubah profil, mengganti kata sandi, dan menonaktifkan akun sendiri. Admin atau owner dapat membuka daftar dan detail pengguna. Owner dapat mengubah nama dan telepon serta menonaktifkan akun lain. Penggantian peran mengikuti hierarki level backend. Halaman peran menyediakan katalog serta pembuatan, pengubahan, dan penghapusan peran kustom. Backend tidak mengizinkan perubahan email melalui endpoint edit. Pencarian hanya menyaring pengguna pada halaman yang sudah dimuat karena API daftar tidak menyediakan parameter pencarian. Muat ulang mengambil halaman pertama; tombol “Muat lainnya” memuat halaman berikutnya.

Seeder development backend menyediakan `demo-admin@example.test` dengan peran owner. Kata sandinya diambil dari `SEED_DEMO_USER_PASSWORD` milik backend; tidak disimpan di frontend.

Token akses dan refresh hanya disimpan di memori tab. Muat ulang browser meminta login lagi. Access token diperbarui lewat `/auth/refresh-token` ketika mendekati kedaluwarsa; token tidak disimpan di localStorage.

## Verifikasi

```sh
npm run lint
npm run test
npm run build
npm run docs:api
```

`npm run docs:api` membuat HTML referensi API TypeScript dari komentar TSDoc pada entry point modul dan deklarasi publiknya. Hasilnya ada di `docs/api-reference/index.html` dan dibuat ulang saat source berubah.

Tes HTTP menjalankan client terhadap server tiruan lokal dengan bentuk respons dari OpenAPI. Tes itu memeriksa path, metode, payload, pemetaan respons, konflik peran, dan kegagalan kredensial. Pemeriksaan Chrome terhadap backend nyata telah membuktikan health `200` dan login salah `422`; operasi tulis tidak dijalankan pada database nyata selama verifikasi.
