import styles from './index.module.css';

type Props = {
  theme: string;
  themeEmoji: string;
};

export function TeamScheduleCardTheme({ theme, themeEmoji }: Props) {
  return (
    <div
      className={`mt-2.5 min-h-[2.65rem] pt-2.5 text-xs font-medium italic leading-snug text-slate-600 ${styles.themeDivider}`}
    >
      {themeEmoji} {theme}
    </div>
  );
}
