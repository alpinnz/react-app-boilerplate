# Cakupan API contoh

Modul contoh dalam repository ini mengasumsikan REST API dengan prefix `/api/v1`. Backend dan dokumen OpenAPI tidak disertakan. `VITE_API_BASE_URL` berisi origin backend; HTTP client menambahkan prefix tersebut. Tes memakai server tiruan lokal untuk memeriksa request dan response yang diharapkan modul, bukan memvalidasi server nyata.

| Operasi | Alur aplikasi |
| --- | --- |
| `GET /health` | Halaman `/status` |
| `POST /auth/register` | Form `/register` |
| `POST /auth/login` | Form `/login` |
| `POST /auth/logout` | Tombol Keluar |
| `POST /auth/refresh-token` | Rotasi otomatis saat token mendekati kedaluwarsa |
| `GET /roles` | Katalog `/roles` dan pilihan peran pada detail pengguna |
| `POST /roles` | Form buat peran |
| `GET /roles/{role_id}` | Detail peran |
| `PATCH /roles/{role_id}` | Form edit peran kustom |
| `DELETE /roles/{role_id}` | Dialog hapus peran kustom |
| `POST /users` | Klien mendukung alias pembuatan akun ini; UI memakai `/auth/register` agar pengguna tidak mendapat dua form identik |
| `GET /users` | Daftar `/users` dengan pagination |
| `GET /users/me` | Membaca sesi saat login dan halaman `/account` |
| `PATCH /users/me` | Form profil sendiri |
| `DELETE /users/me` | Form nonaktifkan akun dengan kata sandi |
| `PUT /users/me/password` | Form ganti kata sandi |
| `PATCH /users/{user_id}/role` | Form ubah peran pada detail pengguna |
| `GET /users/{user_id}` | Halaman detail `/users/:userId` |
| `PUT /users/{user_id}` | Dialog edit pengguna oleh owner |
| `DELETE /users/{user_id}` | Dialog nonaktifkan pengguna oleh owner |

Aturan izin dalam tabel ini adalah asumsi modul contoh. Backend aplikasi tetap harus menjadi sumber kebenaran otorisasi. UI menyembunyikan tindakan yang jelas tidak diizinkan: daftar/detail pengguna memerlukan admin atau owner, edit/nonaktifkan pengguna lain memerlukan owner, dan penggantian peran hanya ditawarkan bila level aktor lebih tinggi dari peran saat ini dan peran tujuan. Peran bawaan tidak dapat diubah atau dihapus. Kegagalan `401`, `403`, `409`, dan validasi ditampilkan tanpa menyalin detail internal server.

Modul contoh mengharapkan perubahan kata sandi dan penonaktifan akun mencabut sesi di backend; klien lalu menghapus token dari memori dan meminta login ulang. Pendaftaran tidak menerbitkan token dalam alur contoh ini. Sesuaikan asumsi tersebut dengan kontrak server yang digunakan.
