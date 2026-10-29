# Cakupan kontrak API

Dokumen ini memetakan kontrak OpenAPI layanan backend yang dikonsumsi aplikasi ini. Host API berasal dari `VITE_API_BASE_URL`; klien menambahkan `/api/v1`. Pengujian HTTP di `tests/api-integration.test.ts` dan `tests/contract-coverage.test.ts` memeriksa metode, path, payload, serta bentuk respons.

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

Backend tetap menjadi sumber kebenaran izin. UI menyembunyikan tindakan yang jelas tidak diizinkan: daftar/detail pengguna memerlukan admin atau owner, edit/nonaktifkan pengguna lain memerlukan owner, dan penggantian peran hanya ditawarkan bila level aktor lebih tinggi dari peran saat ini dan peran tujuan. Peran bawaan tidak dapat diubah atau dihapus. Kegagalan `401`, `403`, `409`, dan validasi ditampilkan tanpa menyalin detail internal server.

Perubahan kata sandi dan penonaktifan akun mencabut sesi di backend; klien segera menghapus token dari memori dan meminta login ulang. Pendaftaran tidak menerbitkan token, sesuai kontrak.
