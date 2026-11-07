# React App Boilerplate

Starter SPA modular dengan React 19, TypeScript 7, React Router, Zustand, Tailwind CSS v4, dan Valfuse localization untuk bahasa Indonesia dan Inggris.

Repository ini menyertakan modul contoh untuk autentikasi, akun, pengguna, peran, dan status layanan. Modul tersebut menunjukkan pola arsitektur yang dapat digunakan ulang dan mengacu pada kontrak OpenAPI yang diberikan, diringkas di [docs/api-coverage.md](docs/api-coverage.md). Ganti modul atau adapter API agar sesuai dengan backend aplikasi Anda.

## Quick start

1. Gunakan Node.js dan pnpm sesuai field `engines` dan `packageManager` di `package.json`. Jika perintah `pnpm` belum tersedia, jalankan `corepack enable pnpm` sekali.
2. Jalankan `pnpm install --frozen-lockfile`.
3. Salin `.env.example` ke `.env.local`, lalu atur `VITE_API_BASE_URL` jika backend berjalan pada host lain.
4. Jalankan `pnpm run dev` dan buka URL yang ditampilkan Vite.

Repository ini tidak menyertakan backend. `VITE_API_BASE_URL` adalah origin backend tanpa `/api/v1`; HTTP client menambahkan prefix tersebut.

## Modul contoh

- `src/modules/auth`: login, pendaftaran, dan pemulihan sesi dari `localStorage`.
- `src/modules/account`: profil, kata sandi, dan penonaktifan akun.
- `src/modules/users`: daftar, detail, perubahan peran, dan tindakan admin.
- `src/modules/roles`: katalog dan pengelolaan peran.
- `src/modules/health`: contoh halaman status layanan.
- `src/modules/onboarding`: pengenalan fitur aplikasi dengan ilustrasi SVG.

Setiap modul memiliki batas domain, data, presentation, dependency injection, dan route. `src/app` menyusun public API modul melalui `src/App.tsx`; `src/shared` berisi komponen dan tipe lintas modul.

## Perintah

```sh
pnpm run dev
pnpm run storybook
pnpm run build-storybook
pnpm run lint
pnpm run test
pnpm run build
pnpm run assets:generate
pnpm run assets:check
pnpm run i18n:validate
pnpm run docs:api
```

Perubahan sumber localization di `locales/<module>/{id,en}.json` perlu diikuti `pnpm run i18n:generate` dan `pnpm run i18n:validate`. Jangan edit output di `src/app/localization/generated/` secara manual. Tes memakai server HTTP lokal tiruan dan tidak memerlukan backend nyata.

## Localization, aset, dan desain

Pesan Valfuse dikelompokkan berdasarkan modul di `locales/`. Setelah mengubah pesan, jalankan `pnpm run i18n:generate` dan `pnpm run i18n:validate`; jangan edit hasil di `src/app/localization/generated/` secara manual.

Simpan aset statis di `public/`, lalu jalankan `pnpm run assets:generate`. Gunakan URL bertipe dari `src/shared/assets/generated/assets.ts` di komponen, dan jalankan `pnpm run assets:check` untuk memastikan registry tetap sesuai isi `public/`. Registry dibuat oleh `@valfuse-node/assets`; library ini memetakan aset ke URL dan tidak membuat atau mengubah file SVG. Jangan edit registry secara manual. Generator memerlukan Node.js 22.12.0 atau lebih baru; versi minimum proyek mengikuti batas toolchain di `package.json`.

Token warna, ukuran, dan surface berada di `src/app/styles/tokens/`; gunakan token semantik pada komponen. Lihat [docs/design-system.md](docs/design-system.md) dan [docs/project-structure.md](docs/project-structure.md).

## Konfigurasi dan keamanan

Jangan taruh secret di variabel `VITE_*`; nilainya dikirim ke bundle browser. Access token dan refresh token untuk modul contoh disimpan di `localStorage` agar sesi dapat dipulihkan setelah halaman dimuat ulang. Gunakan `.env.local` untuk konfigurasi lokal dan jangan commit file tersebut.
