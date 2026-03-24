import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white px-4 py-4 text-center">
      <p className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-slate-400">
        <span>Made with</span>
        <Heart className="size-3 shrink-0 text-red-500" aria-hidden />
        <span>by Marcelo Camargo</span>
      </p>
    </footer>
  );
}
