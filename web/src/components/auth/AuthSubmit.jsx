import { ArrowRight, Loader2 } from "lucide-react";

export default function AuthSubmit({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-forest text-white font-semibold py-4 hover:bg-forest-soft disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {children}
          <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
        </>
      )}
    </button>
  );
}
