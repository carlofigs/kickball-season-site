import { Beer } from 'lucide-react';

type Props = {
  postPlaySocial: string;
};

export function GameCardPostPlay({ postPlaySocial }: Props) {
  return (
    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
      <Beer className="size-[13px] shrink-0" aria-hidden />
      Post-play: <span className="font-semibold text-slate-700">{postPlaySocial}</span>
    </div>
  );
}
