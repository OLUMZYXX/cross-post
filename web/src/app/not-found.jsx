import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-neutral-600 text-7xl font-extrabold mb-4 font-headline">404</p>
        <p className="text-neutral-400 text-sm mb-6">Page not found</p>
        <Link
          href="/"
          className="text-black text-sm bg-gradient-to-r from-green-500 to-emerald-400 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
