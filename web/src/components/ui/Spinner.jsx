import { Loader2 } from "lucide-react";

export default function Spinner({ size = 24, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <Loader2 size={size} className="animate-spin text-cp-accent" />
    </div>
  );
}
