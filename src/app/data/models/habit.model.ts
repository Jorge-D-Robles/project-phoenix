/** Frequency at which a habit is tracked */
export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/** A habit definition stored in habits.json in Drive appdata */
export interface Habit {
  readonly id: string;           // UUID v4
  readonly title: string;        // Non-empty
  readonly frequency: HabitFrequency;
  readonly targetValue: number;  // Positive integer >= 1
  readonly color: string;        // Hex color #RRGGBB or #RGB
  readonly archived: boolean;    // Defaults false
  readonly created: string;      // ISO 8601 UTC
  readonly lastModified: string; // ISO 8601 UTC
}

/** A single log entry for a habit on a specific date */
export interface HabitLog {
  readonly habitId: string;  // UUID reference
  readonly date: string;     // YYYY-MM-DD
  readonly value: number;    // Non-negative integer
}

/** Shape of the habits.json file stored in Google Drive appdata */
export interface HabitsData {
  readonly habits: readonly Habit[];
  readonly logs: readonly HabitLog[];
}

/**
 * Compute the heatmap intensity level for a given value.
 *
 * Quartile-based: 0 = no activity, 1-4 = low to peak.
 * See docs/heatmap-algorithm.md for full specification.
 */
export function getLevel(value: number, maxValue: number): number {
  if (value === 0) return 0;
  if (maxValue === 0) return 0;
  const ratio = value / maxValue;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.50) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}
