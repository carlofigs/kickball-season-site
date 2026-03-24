import { Package, Wrench } from 'lucide-react';
import { TeamScheduleFieldDutyBadge } from './field_duty_badge';
import { NoFieldDutiesPlaceholder } from './no_field_duties';
import styles from './index.module.css';

type Props = {
  setupTime: string | null;
  packTime: string | null;
};

export function TeamScheduleFieldDuties({ setupTime, packTime }: Props) {
  const hasBadges = setupTime != null || packTime != null;

  return (
    <div className={styles.fieldDutiesSection}>
      <div className="flex flex-wrap items-center gap-2">
        {hasBadges ? (
          <>
            {setupTime != null ? (
              <TeamScheduleFieldDutyBadge Icon={Wrench} variant="setup" time={setupTime} />
            ) : null}
            {packTime != null ? (
              <TeamScheduleFieldDutyBadge Icon={Package} variant="pack" time={packTime} />
            ) : null}
          </>
        ) : (
          <NoFieldDutiesPlaceholder />
        )}
      </div>
    </div>
  );
}
