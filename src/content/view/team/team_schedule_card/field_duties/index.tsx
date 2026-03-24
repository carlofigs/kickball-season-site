import { Flag, Package, Wrench } from 'lucide-react';
import type { PitchField } from '../../../../../types/schedule';
import { TeamScheduleFieldDutyBadge } from './field_duty_badge';
import { NoFieldDutiesPlaceholder } from './no_field_duties';
import styles from './index.module.css';

export type LineRefDutySlot = {
  time: string;
  field: PitchField;
};

type Props = {
  setupTime: string | null;
  packTime: string | null;
  lineRefSlot: LineRefDutySlot | null;
};

export function TeamScheduleFieldDuties({ setupTime, packTime, lineRefSlot }: Props) {
  const hasBadges = setupTime != null || packTime != null || lineRefSlot != null;

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
            {lineRefSlot != null ? (
              <TeamScheduleFieldDutyBadge
                Icon={Flag}
                variant="lineRef"
                time={lineRefSlot.time}
                field={lineRefSlot.field}
              />
            ) : null}
          </>
        ) : (
          <NoFieldDutiesPlaceholder />
        )}
      </div>
    </div>
  );
}
