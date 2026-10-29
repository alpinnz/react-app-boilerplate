# React App Boilerplate

Starter SPA modular dengan React 19, TypeScript 7, React Router, Zustand, Tailwind CSS v4, dan Valfuse localization untuk bahasa Indonesia dan Inggris.

Repository ini menyertakan modul contoh untuk autentikasi, akun, pengguna, peran, dan status layanan. Modul tersebut menunjukkan pola arsitektur yang dapat digunakan ulang dan mengasumsikan REST API contoh yang dicatat di [docs/api-coverage.md](docs/api-coverage.md). Ganti modul atau adapter API agar sesuai dengan backend aplikasi Anda.

## Quick start

1. Gunakan Node.js yang memenuhi field `engines` di `package.json`.
2. Jalankan `npm ci`.
3. Salin `.env.example` ke `.env.local`, lalu atur `VITE_API_BASE_URL` jika backend berjalan pada host lain.
4. Jalankan `npm run dev` dan buka URL yang ditampilkan Vite.

Repository ini tidak menyertakan backend. `VITE_API_BASE_URL` adalah origin backend tanpa `/api/v1`; HTTP client menambahkan prefix tersebut.

## Modul contoh

- `src/modules/auth`: login, pendaftaran, dan sesi di memori tab.
- `src/modules/account`: profil, kata sandi, dan penonaktifan akun.
- `src/modules/users`: daftar, detail, perubahan peran, dan tindakan admin.
- `src/modules/roles`: katalog dan pengelolaan peran.
- `src/modules/health`: contoh halaman status layanan.

Setiap modul memiliki batas domain, data, presentation, dependency injection, dan route. `src/app` menyusun public API modul melalui `src/App.tsx`; `src/shared` berisi komponen dan tipe lintas modul.

## Perintah

```sh
npm run dev
npm run lint
npm test
npm run build
npm run i18n:validate
npm run docs:api
```

Perubahan sumber localization di `locales/<module>/{id,en}.json` perlu diikuti `npm run i18n:generate` dan `npm run i18n:validate`. Jangan edit output di `src/app/localization/generated/` secara manual. Tes memakai server HTTP lokal tiruan dan tidak memerlukan backend nyata.

## Localization dan desain

Pesan Valfuse dikelompokkan berdasarkan modul di `locales/`. Token warna, ukuran, dan surface berada di `src/app/styles/tokens/`; gunakan token semantic pada komponen. Lihat [docs/design-system.md](docs/design-system.md) dan [docs/project-structure.md](docs/project-structure.md).

## Konfigurasi dan keamanan

Jangan taruh secret di variabel `VITE_*`; nilainya dikirim ke bundle browser. Access token dan refresh token untuk modul contoh hanya disimpan di memori tab. Gunakan `.env.local` untuk konfigurasi lokal dan jangan commit file tersebut.
