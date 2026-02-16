export type FocusSessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED';

export interface FocusSession {
  readonly id: string;
  readonly taskId: string | null;
  readonly taskTitle: string | null;
  readonly startTime: string;      // ISO 8601 UTC
  readonly plannedDuration: number; // minutes
  readonly actualDuration: number;  // minutes
  readonly completed: boolean;
  readonly type: FocusSessionType;
}

export interface FocusSettings {
  readonly workDuration: number;           // default 25
  readonly shortBreakDuration: number;     // default 5
  readonly longBreakDuration: number;      // default 15
  readonly sessionsBeforeLongBreak: number; // default 4
  readonly autoStartBreaks: boolean;       // default false
  readonly autoStartWork: boolean;         // default false
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
};
