import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-neutral-600 text-6xl font-extrabold mb-4 font-headline">404</p>
        <p className="text-neutral-400 text-sm mb-6">Page not found</p>
        <Link
          href="/"
          className="text-white text-sm bg-neutral-800 px-4 py-2 rounded-xl hover:bg-neutral-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
