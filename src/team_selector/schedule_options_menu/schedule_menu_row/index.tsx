import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Used when `disabled` (e.g. export in progress). */
  disabledCursor?: 'wait' | 'not-allowed';
};

export function ScheduleMenuRow({
  icon,
  children,
  onClick,
  disabled = false,
  disabledCursor = 'not-allowed',
}: Props) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium ${
        disabled
          ? disabledCursor === 'wait'
            ? 'cursor-wait text-slate-400'
            : 'cursor-not-allowed text-slate-400'
          : 'cursor-pointer text-slate-700 hover:bg-slate-50'
      }`}
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
    >
      <span
        className={`flex shrink-0 [&_svg]:size-4 ${disabled ? 'text-slate-300' : 'text-slate-500'}`}
        aria-hidden
      >
        {icon}
      </span>
      {children}
    </button>
  );
}
