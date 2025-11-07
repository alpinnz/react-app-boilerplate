// not_found_page.tsx

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 px-6">
      <div className="text-center">
        <div className="text-[72px] font-bold">404</div>
        <div className="text-xl font-semibold mt-2">Halaman tidak ditemukan</div>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>
        {/*<Link*/}
        {/*    to="/dashboard"*/}
        {/*    className="inline-block mt-6 px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"*/}
        {/*>*/}
        {/*    Kembali ke Dashboard*/}
        {/*</Link>*/}
      </div>
    </div>
  );
}
