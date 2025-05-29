
import { Package } from 'lucide-react';
import Link from 'next/link';

export function Logo({ size = "normal" }: { size?: "small" | "normal" | "large" }) {
  const iconSizeClass = size === "small" ? "h-6 w-6" : size === "large" ? "h-10 w-10" : "h-8 w-8";
  const textSizeClass = size === "small" ? "text-xl" : size === "large" ? "text-3xl" : "text-2xl";

  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label="SwiftTrack Home">
      <Package className={`${iconSizeClass} text-primary group-hover:animate-pulse`} />
      <span className={`${textSizeClass} font-bold text-primary group-hover:text-primary/90 transition-colors`}>SwiftTrack</span>
    </Link>
  );
}
