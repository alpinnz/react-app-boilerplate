# Design system

UI memakai Tailwind CSS v4 dengan konfigurasi CSS-first. Vite memuat `@tailwindcss/vite`; entry CSS adalah `src/app/styles/globals.css`. Tidak ada `tailwind.config.js` atau lapisan komponen CSS tambahan.

## Alur token

```text
primitive.css → semantic.css → utility Tailwind → komponen presentasi
```

- `tokens/primitive.css` menyimpan nilai mentah: palet warna, radius, bayangan, dan font. Nama primitive menggambarkan skala, bukan penggunaan komponen.
- `tokens/semantic.css` memetakan primitive ke peran seperti `canvas`, `surface`, `content`, `line`, `action`, `danger`, dan `focus`. Komponen memakai utility semantic (`bg-surface`, `text-content`, `border-line`).
- Pemetaan dark mode mengikuti `prefers-color-scheme`. Perubahan tema cukup mengubah nilai semantic; komponen tidak perlu menduplikasi kelas `dark:`.
- `globals.css` hanya berisi impor Tailwind, impor token, dan aturan dasar browser. Gaya komponen berada bersama komponen dalam kelas utility statis.

Gunakan token semantic baru hanya ketika ada peran visual baru yang jelas. Jangan menaruh kode warna atau utility palet primitive langsung di komponen. Nilai `className` dinamis dipilih dari peta kelas statis agar scanner Tailwind dapat menemukannya.

## Kepemilikan komponen

| Tingkat | Lokasi | Tanggung jawab |
| --- | --- | --- |
| Atom | `shared/presentation/ui/atoms` | Kontrol atau permukaan dasar: `Button`, `Input`, `Surface` |
| Molekul | `shared/presentation/ui/molecules` | Gabungan kecil dengan satu tujuan: `TextField`, `InlineFeedback` |
| Organisme shared | `shared/presentation/ui/organisms` | Interaksi dan navigasi reusable: `Modal`, `ConfirmationDialog`, `TopNavigation`, `SideNavigation` |
| Organisme modul | `modules/*/presentation/organisms` | Komposisi yang tahu domain modul: `UserList` |
| Pattern | `shared/presentation/ui/patterns` | Susunan interaksi yang dipakai beberapa flow: `AsyncActionPattern` untuk error dan action area |
| Shell adapter | `app/shell` | Menghubungkan session dan router ke komponen shared: `AuthenticatedHeader`, `AuthenticatedSidebar` |
| Template | `app/templates` | Kerangka halaman dan penempatan slot: `AppTemplate`, `AuthTemplate` |
| Page | `modules/*/presentation/pages` | Memilih data, status, dan tindakan modul |

Klasifikasi ini berlaku hanya pada presentasi. Domain, repository, data source, dan store tetap berada di lapisan modul sesuai panduan arsitektur. Route halaman didefinisikan di modul, lalu `app/router` merakitnya dengan template dan guard bersama. Page modul tidak mengimpor `app`; komponen shared tidak mengimpor modul. Tambahkan komponen atau tingkat baru bila ada tanggung jawab nyata, bukan demi simetri folder.

## Lokasi dan penamaan komponen

- Komponen visual yang tidak mengetahui alur bisnis ditempatkan di `shared/presentation/ui` dan menerima nilai serta callback lewat props. Contoh: `TopNavigation`, `SideNavigation`, `ConfirmationDialog`.
- Adapter yang membaca session, route, atau use case tetap di `app/shell`. Awali nama dengan konteks yang menjelaskan batas itu, seperti `AuthenticatedHeader`, bukan nama generik atau awalan `App` pada semua komponen.
- Komponen yang memahami satu domain ditempatkan di `modules/<module>/presentation`. Gunakan nama berdasarkan tanggung jawab domain, seperti `UserList` atau `DeleteUserDialog`.
- Gunakan PascalCase untuk file dan export komponen React. Nama komponen menyatakan bentuk atau tanggung jawab (`SideNavigation`, `TextField`); hindari nama terlalu umum seperti `Common`, `Base`, `Widget`, dan `Component`.
- Dependensi mengalir dari app/module ke shared. Shared UI boleh memakai komponen shared lain, tetapi tidak boleh membaca context module atau mengimpor router/app. Aksi navigasi dan autentikasi dikirim sebagai callback dari adapter.
- Modul tidak mengimpor modul lain secara langsung. `app/router` mengintegrasikan public API modul dan meneruskan operasi lintas modul melalui props; aturan import ini ditegakkan oleh ESLint.
