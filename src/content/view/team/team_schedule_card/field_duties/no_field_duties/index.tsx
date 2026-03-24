import { ClipboardCheck } from 'lucide-react';

export function NoFieldDutiesPlaceholder() {
  return (
    <span className="box-border inline-flex min-h-7 items-center gap-[0.35rem] rounded-lg border border-dashed border-slate-300 bg-slate-50/95 px-[0.65rem] py-[0.3125rem] text-[0.6875rem] font-bold leading-none text-slate-500 not-italic [&_svg]:block [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:opacity-80">
      <ClipboardCheck aria-hidden />
      <span>No field duties</span>
    </span>
  );
}
