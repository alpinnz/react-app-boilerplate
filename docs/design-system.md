# Design system

UI memakai Tailwind CSS v4 dengan konfigurasi CSS-first. Vite memuat `@tailwindcss/vite`; entry CSS adalah `src/app/styles/globals.css`. Tidak ada `tailwind.config.js` atau lapisan komponen CSS tambahan.

## Alur token

```text
primitive.css → semantic.css + typography.css → utility Tailwind → komponen presentasi
```

- `tokens/primitive.css` menyimpan nilai mentah: palet warna, radius, bayangan, dan font. Nama primitive menggambarkan skala, bukan penggunaan komponen.
- `tokens/semantic.css` memetakan primitive ke peran seperti `canvas`, `surface`, `content`, `line`, `action`, `danger`, dan `focus`. Komponen memakai utility semantic (`bg-surface`, `text-content`, `border-line`).
- Token spacing semantik (`page-gutter`, `page-block`, `surface`, `section`, `form`, `field`) memakai `clamp()` agar berubah bertahap mengikuti lebar viewport: gutter 16–32 px, block 24–32 px, surface/section 16–24 px, form 12–16 px, dan field 6–8 px.
- Light mode menjadi tema awal. Pilihan tema tersimpan di `localStorage` (`app-theme`); atribut `data-theme="dark"` mengaktifkan semantic token dark dan varian Tailwind `dark:` melalui `@custom-variant`. Komponen memakai semantic token agar perubahan tema berlaku konsisten tanpa warna literal.
- `globals.css` memuat Tailwind, token, varian `dark:`, dan aturan dasar browser. Gaya komponen berada bersama komponen dalam kelas utility statis.

## Typography

`tokens/typography.css` menyediakan utility `text-app-{role}-{weight}` dengan font family lokal proyek (`Inter Variable`) dan weight 400/500/600/700. Tracking mengikuti konteks untuk merapikan ritme baca: display `-0.02em`, heading `-0.015em`, subtitle `-0.005em`, body dan kontrol netral, label/tabel `0.01em`. Profil mobile berlaku di bawah 768 px, tablet pada 768–1023 px, dan desktop mulai 1024 px. Nilai tablet merupakan interpolasi skala dari token mobile dan desktop, dibulatkan ke piksel terdekat.

| Role | Mobile (size / line-height) | Tablet (size / line-height) | Desktop (size / line-height) | Catatan |
| --- | ---: | ---: | ---: | --- |
| Display 5 | 42 / 63 px | 45 / 68 px | 48 / 72 px | — |
| Display 4 | 34 / 51 px | 37 / 56 px | 40 / 60 px | — |
| Display 3 | 28 / 42 px | 30 / 45 px | 32 / 48 px | — |
| Display 2 | 24 / 36 px | 26 / 39 px | 28 / 42 px | — |
| Display 1, header, title | 20 / 30 px | 22 / 33 px | 24 / 36 px | Title memakai `capitalize` |
| Subtitle | 16 / 24 px | 18 / 27 px | 20 / 30 px | — |
| Body regular, hyperlink regular | 14 / 21 px | 15 / 23 px | 16 / 24 px | — |
| Body small | 12 / 18 px | 13 / 20 px | 14 / 21 px | — |
| Caption | 12 / 18 px | 12 / 18 px | 12 / 18 px | — |
| Support | 8 / 12 px | 8 / 12 px | 8 / 12 px | — |
| Hyperlink small, hyperlink caption | 12 / 18 px | 13 / 20 px | 14 / 21 px | Bergaris bawah |
| Placeholder | 14 / 21 px | 14 / 21 px | 14 / 21 px | Dipakai pada placeholder input |
| Button text | 14 / 21 px | 14 / 18 px | 14 / 14 px | — |
| Label | 12 / 18 px | 12 / 15 px | 12 / 12 px | — |
| Header table | 14 / 21 px | 15 / 23 px | 16 / 24 px | Sentence case agar mudah dipindai |

Utility Tailwind ukuran teks yang lama tetap kompatibel dan diarahkan ke token yang sama: `text-xs` ke label, `text-sm` ke body regular, `text-base` ke subtitle, `text-lg` ke title, `text-xl` ke display 2, lalu `text-2xl`–`text-4xl` ke display 3–5. Untuk peran spesifik, gunakan utility `text-app-*` agar weight dan aturan khususnya terlihat jelas pada komponen.

Gunakan token semantic baru hanya ketika ada peran visual baru yang jelas. Jangan menaruh kode warna atau utility palet primitive langsung di komponen. Nilai `className` dinamis dipilih dari peta kelas statis agar scanner Tailwind dapat menemukannya.

## Konvensi komponen

Komponen UI memakai token proyek untuk ukuran, warna, fokus, garis, radius, dan elevasi. Gunakan komponen bersama sebagai dasar agar state visual dan perilaku aksesibel konsisten.

| Area | Konvensi proyek |
| --- | --- |
| Form dan pencarian | `Input*`, `InputSelect`, `InputPhoneNumber`, `GroupForm`, `InputSearch`, dan `InlineFeedback` memakai tinggi kontrol 40 px. `GroupForm` menghubungkan label, petunjuk, dan error ke kontrol; field telepon menyimpan nomor dan kode panggilan secara terpisah. |
| Tombol dan tautan | `Button` menyediakan variasi primary, secondary, tertiary, neutral, neutral-bordered, danger, dan quiet. Ukuran tombol 36/40/48 px dipilih lewat `size`; loading menampilkan spinner tanpa menghilangkan nama aksesibel. `ButtonLink` mempertahankan semantik anchor untuk aksi navigasi. `Hyperlink` menyediakan treatment neutral/solid, state hover/focus/visited, dan ikon trailing opsional. |
| Aksi ikon | `IconButton` menyediakan target 36/40/48 px dan accessible label. Gunakan untuk menu, tutup, toggle, dan tindakan icon-only agar ukuran, fokus, disabled, serta hover tetap seragam. |
| Tabel dan daftar | `DataTable` menangani sorting, loading, dan empty state; tinggi baris standar 72 px dan dapat bertambah mengikuti konten. Daftar dapat menyediakan row-list khusus ponsel melalui `renderMobileRow` tanpa menggandakan state atau aksi. |
| Modal | `Modal` membatasi lebar desktop hingga 480 px dan tinggi hingga 80vh. Pada layar kecil, modal menjadi bottom sheet dengan body yang dapat digulir, safe-area, dan footer aksi responsif. |
| Navigasi | `SideNavigation` menangani state aktif, collapsed, dan drawer dengan item minimum 40 px. `Breadcrumbs` memakai markup semantik dan menandai lokasi saat ini. `TopNavigation` menempatkan judul di atas breadcrumbs serta menyediakan popover notifikasi dan akun. |
| Aksi halaman | Search, filter, dan tindakan halaman mengikuti susunan responsif; di ponsel, kontrol mendapat ruang sendiri agar label dan aksi tidak terjepit. |
| Onboarding | `OnboardingPage` menyimpan slide aktif, status slide terlokalisasi, dan navigasi titik; aksi lanjut dan lewati memakai komponen tombol bersama. |
| Notifikasi | `ToastProvider` memetakan status informasi, sukses, error, dan peringatan ke token semantik, mengelola queue dan dismiss, serta menjaga notifikasi agar tidak menutupi konten ponsel. |

`PageShell` adalah surface konten standar pada route. Shell memakai `bg-surface`, `rounded-surface`, `shadow-surface`, dan padding `p-surface` yang responsif. `titleSection` tersedia sebagai slot opsional agar judul dan breadcrumbs tidak berulang dengan `TopNavigation`. `PageFrame` menangani canvas route, gutter, scroll, dan alignment di luar surface. `AppTemplate` menyusun navbar, sidebar, isi halaman, dan footer metadata.

## Wrapper aplikasi

Ukuran wrapper berikut diverifikasi langsung pada DOM Chrome di 320×760, 768×900, 1440×900, dan 1920×1080.

| Area | Ukuran dan perilaku |
| --- | --- |
| Header aplikasi (`TopNavigation`) | Tinggi 80 px pada ponsel, tablet, dan desktop; padding vertikal 6 px. Memenuhi lebar area setelah sidebar di desktop dan seluruh lebar viewport di ponsel. Gutter horizontal memakai token fluida dari 16 px pada layar kecil hingga 32 px pada desktop lebar. Judul berada di atas breadcrumbs; pada ponsel breadcrumbs mengisi baris kedua, sementara grup aksi berada di tengah vertikal header. Tombol notifikasi dan avatar mengikuti shell 40×40 px. |
| Sidebar desktop | Lebar 256 px saat terbuka dan 80 px saat diciutkan; baris branding 80 px; item navigasi minimum 40 px. |
| Drawer navigasi ponsel | Lebar 256 px, tinggi viewport, overlay penuh; baris branding 80 px dan item navigasi minimum 40 px. |
| Area konten dan footer aplikasi | Konten dan footer memakai seluruh area kerja setelah sidebar dengan gutter fluida yang sama seperti navbar: 16 px pada layar kecil hingga 32 px pada desktop lebar. Footer metadata berada di bawah `PageShell` sebagai surface tersendiri, dengan jarak `section` dan tipografi caption. |
| Template autentikasi (`AuthTemplate`) | Pada 1440×900, kartu memiliki lebar maksimum 1024 px dan layout dua kolom. Pada 390 px, kartu memakai gutter 16 px per sisi dan layout satu kolom. Template memakai token semantik dan kontrol form 40 px; panel ilustrasi hanya muncul ketika ruang desktop mencukupi. |

Gunakan ukuran tersebut sebagai kontrak wrapper project. Saat menambah route atau state baru, pertahankan header title/breadcrumb, aksi notifikasi dan profil, serta sidebar shell; jaga footer metadata setelah konten tanpa menjadikannya footer aksi.

Saat menyesuaikan komponen, periksa state normal, hover/fokus, disabled/loading, kosong/error, serta lebar desktop, tablet, dan ponsel. Biarkan isi menentukan tinggi panel; footer metadata berada sebagai surface terpisah di bawah konten dan tetap di dasar viewport tanpa meregangkan kartu data.

## Tipografi dan penulisan

UI memakai Inter Variable yang di-host secara lokal melalui Fontsource. Font ini berlisensi SIL Open Font License dan importnya hanya ditempatkan di `globals.css`; komponen tidak perlu mengatur font family sendiri. `--font-sans` menjadi satu-satunya font stack untuk UI.

Gunakan `PageHeading` untuk judul halaman dan section. Judul halaman memakai peran `title`, judul section memakai `subtitle`, dan judul modal mengikuti peran `title`; teks isi serta label memakai utility body/form yang sudah diterapkan komponen. Jangan menambahkan ukuran heading baru secara lokal tanpa kebutuhan layout yang jelas.

Gunakan sentence case pada teks biasa, istilah yang sama untuk konsep yang sama, serta kalimat pendek yang menjelaskan tindakan atau hasilnya. Utility peran `title` menerapkan kapitalisasi awal kata. Pakai tanda elipsis karakter tunggal (`…`) untuk state yang sedang memuat. Simpan istilah teknis seperti level akses di halaman pengelolaan peran; jangan tampilkan detail implementasi itu pada profil yang tidak membutuhkannya.

## Kepemilikan komponen

| Tingkat | Lokasi | Tanggung jawab |
| --- | --- | --- |
| Atom | `shared/presentation/ui/atoms` | Kontrol atau permukaan dasar: `Button`, `IconButton`, `ButtonLink`, `Hyperlink`, `InputText`, `InputEmail`, `InputPassword`, `InputSearch`, `InputNumber`, `InputSelect`, `Surface` |
| Molekul | `shared/presentation/ui/molecules` | Gabungan kecil dengan satu tujuan: `Breadcrumbs`, `GroupForm`, `InputPhoneNumber`, `TextField`, `SelectField`, `InlineFeedback`, `PageHeading` |
| Organisme shared | `shared/presentation/ui/organisms` | Interaksi, navigasi, dan data display reusable: `Modal`, `ConfirmationDialog`, `DataTable`, `ToastProvider`, `TopNavigation`, `SideNavigation` |
| Organisme modul | `modules/*/presentation/organisms` | Komposisi yang tahu domain modul: `UserList` |
| Pattern | `shared/presentation/ui/patterns` | Susunan interaksi yang dipakai beberapa flow: `AsyncActionPattern` untuk error dan action area |
| Shell adapter | `app/shell` | Menghubungkan session dan router ke komponen shared: `AuthenticatedHeader`, `AuthenticatedSidebar` |
| Template | `app/templates` | Kerangka halaman dan penempatan slot: `AppTemplate`, `AuthTemplate` |
| Page | `modules/*/presentation/pages` | Memilih data, status, dan tindakan modul |

`GroupForm` memiliki label, hint, dan pesan error field. Gunakan bersama kontrol sesuai maksudnya: `InputText`, `InputEmail`, `InputPassword`, `InputSearch`, `InputNumber`, `InputSelect`, atau `InputPhoneNumber`. `TextField` dan `SelectField` tetap tersedia sebagai komposisi ringkas dengan struktur yang sama. Search di sidebar juga memakai `InputSearch` setinggi 40 px; container navigasi mengatur gutter tanpa memperkecil kontrol. Checkbox yang hanya dipakai untuk satu pilihan sederhana dan input tersembunyi tetap native sampai kebutuhan reusable atau perilaku khusus muncul. `InputPhoneNumber` mengirim nomor nasional dan kode panggilan sebagai nilai terpisah agar kontrak API saat ini tetap berlaku. Kontrak tersebut menyimpan kode panggilan (misalnya `+1`), bukan kode ISO; negara yang berbagi kode panggilan tidak dapat dibedakan setelah data dimuat ulang.

`DataTable` menerima kolom dan baris lewat props, menyediakan sorting lokal, kolom pinned untuk menjaga identitas dan aksi saat tabel digeser, serta state loading dan kosong. Gunakan tabel di desktop; bila kartu lebih mudah dibaca di layar kecil, berikan `renderMobileRow` tanpa menggandakan state atau aksi baris. Pagination tetap dimiliki modul: gunakan cursor server bila kontraknya menyediakan cursor, dan pertahankan tombol “Muat lainnya” setelah daftar di desktop maupun mobile. Jangan mengganti pagination server dengan potongan data lokal.

Untuk halaman list/detail yang datanya dapat berubah, gunakan `PullToRefresh` di dalam konten `AppTemplate`. Gestur tarik aktif hanya di mobile saat scroller halaman berada di posisi paling atas. Tetap sediakan tombol refresh yang dapat ditemukan dan dipakai dengan keyboard. Store mempertahankan data terakhir selama refresh dan jika refresh gagal; state `refreshing` tidak boleh mengosongkan tampilan.

`ToastProvider` ditempatkan di composition root supaya operasi modul dapat menampilkan feedback lintas halaman tanpa mengimpor app atau modul lain.

Klasifikasi ini berlaku hanya pada presentasi. Domain, repository, data source, dan store tetap berada di lapisan modul sesuai panduan arsitektur. Route halaman didefinisikan di modul, lalu `app/router` merakitnya dengan template dan guard bersama. Page modul tidak mengimpor `app`; komponen shared tidak mengimpor modul. Tambahkan komponen atau tingkat baru bila ada tanggung jawab nyata, bukan demi simetri folder.

## Lokasi dan penamaan komponen

- Komponen visual yang tidak mengetahui alur bisnis ditempatkan di `shared/presentation/ui` dan menerima nilai serta callback lewat props. Contoh: `TopNavigation`, `SideNavigation`, `ConfirmationDialog`.
- Adapter yang membaca session, route, atau use case tetap di `app/shell`. Awali nama dengan konteks yang menjelaskan batas itu, seperti `AuthenticatedHeader`, bukan nama generik atau awalan `App` pada semua komponen.
- Komponen yang memahami satu domain ditempatkan di `modules/<module>/presentation`. Gunakan nama berdasarkan tanggung jawab domain, seperti `UserList` atau `DeleteUserDialog`.
- Gunakan PascalCase untuk file dan export komponen React. Nama komponen menyatakan bentuk atau tanggung jawab (`SideNavigation`, `TextField`); hindari nama terlalu umum seperti `Common`, `Base`, `Widget`, dan `Component`.
- Dependensi mengalir dari app/module ke shared. Shared UI boleh memakai komponen shared lain, tetapi tidak boleh membaca context module atau mengimpor router/app. Aksi navigasi dan autentikasi dikirim sebagai callback dari adapter.
- Modul tidak mengimpor modul lain secara langsung. `app/router` mengintegrasikan public API modul dan meneruskan operasi lintas modul melalui props; aturan import ini ditegakkan oleh ESLint.

## Modal dan dialog

Gunakan `Modal` bersama untuk menjaga susunan dan aksesibilitas dialog tetap konsisten:

1. **Header** berisi judul dan kontrol tutup. `title` menjadi nama aksesibel dialog.
2. **Garis pemisah** menutup header.
3. **Body** menampilkan `description` sebagai pesan informatif pertama, lalu `children` untuk form, detail, atau konten interaktif. Body dapat digulir tanpa menggeser footer.
4. **Garis pemisah** memisahkan body dari footer.
5. **Footer** menerima aksi melalui prop wajib `footer` dan tetap terlihat saat body digulir.

Jelaskan tujuan, dampak, atau batasan tindakan lewat `description`; tempatkan petunjuk khusus field di dekat field terkait. Jangan menaruh pesan modal pada header atau menambahkan garis footer kedua di dalam `children`. Modal tanpa aksi simpan tetap menyediakan tombol tutup pada footer. `ConfirmationDialog` memakai body untuk pesan konfirmasi dan footer untuk aksi batal/konfirmasi.

Form modal tetap menjadi bagian dari body yang dapat digulir. Karena tombol submit berada di footer di luar elemen form, beri form ID yang unik lalu hubungkan tombol dengan atribut HTML `form`. Pola ini menjaga footer tetap pada tempatnya tanpa membungkus layout bersama dengan form domain. Isi dan aksi spesifik tetap dimiliki modul pemanggil; `Modal` hanya mengatur struktur, semantik dialog, fokus, dan tampilan.

Pada presentasi sheet mobile, handle berada sebelum header. Header, body, garis pemisah, dan footer mengikuti urutan yang sama seperti dialog desktop.

## Storybook

Jalankan `pnpm run storybook` untuk membuka katalog lokal di `http://localhost:6006/`, atau `pnpm run build-storybook` untuk membuat build statis. Navigasi katalog mengikuti kepemilikan arsitektur: `Getting Started`, `Shared UI` (Atoms, Molecules, Organisms, Patterns), lalu `Application` (Localization, Shell, Templates). Gunakan Controls untuk mengubah props, viewport untuk memeriksa ukuran layar, autodocs untuk melihat API komponen, dan tab Accessibility untuk meninjau pemeriksaan aksesibilitas.

Setiap komponen visual reusable di `shared/presentation/ui` memiliki story dekat dengan source-nya. Perilaku `ToastProvider` dicontohkan melalui story `Toast`, karena provider sendiri tidak memiliki tampilan mandiri. Adapter `LanguageSwitcher` dan template `AppTemplate`/`AuthTemplate` juga memiliki story pada kategori `Application`. Komponen yang terikat pada satu domain tetap berada di `modules/<module>/presentation`; tambahkan story di sana bila perlu mendokumentasikan state atau interaksi domain, tanpa memindahkannya ke shared UI.
