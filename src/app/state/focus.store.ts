import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { DEFAULT_FOCUS_SETTINGS } from '../data/models/focus-session.model';
import type { FocusSession, FocusSessionType, FocusSettings, TimerStatus } from '../data/models/focus-session.model';
import { FocusService } from '../data/focus.service';
import { todayDateKey } from '../shared/date.utils';

interface FocusState {
  readonly sessions: FocusSession[];
  readonly settings: FocusSettings;
  readonly loading: boolean;
  readonly error: string | null;

  // Ephemeral timer state
  readonly timerStatus: TimerStatus;
  readonly timerType: FocusSessionType;
  readonly remainingSeconds: number;
  readonly currentSessionStart: string | null;
  readonly linkedTaskId: string | null;
  readonly linkedTaskTitle: string | null;
  readonly sessionsCompleted: number;
}

const initialState: FocusState = {
  sessions: [],
  settings: DEFAULT_FOCUS_SETTINGS,
  loading: false,
  error: null,
  timerStatus: 'IDLE',
  timerType: 'WORK',
  remainingSeconds: 0,
  currentSessionStart: null,
  linkedTaskId: null,
  linkedTaskTitle: null,
  sessionsCompleted: 0,
};

/** Get today's date string in YYYY-MM-DD format */
const todayDateString = (): string => todayDateKey();

export const FocusStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ sessions, settings }) => ({
    todaySessions: computed(() => {
      const today = todayDateString();
      return sessions().filter(s => s.startTime.slice(0, 10) === today);
    }),
    todayFocusMinutes: computed(() => {
      const today = todayDateString();
      return sessions()
        .filter(s => s.startTime.slice(0, 10) === today && s.type === 'WORK')
        .reduce((sum, s) => sum + s.actualDuration, 0);
    }),
    /** Duration in seconds for the current timer type based on settings */
    currentDurationSeconds: computed(() => {
      const s = settings();
      return s.workDuration * 60;
    }),
  })),
  withMethods((store, focusService = inject(FocusService)) => {
    let intervalId: ReturnType<typeof window.setInterval> | null = null;

    function clearTimerInterval(): void {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    function startInterval(): void {
      clearTimerInterval();
      intervalId = window.setInterval(() => {
        tick();
      }, 1000);
    }

    function getDurationForType(type: FocusSessionType): number {
      const settings = store.settings();
      switch (type) {
        case 'WORK':
          return settings.workDuration * 60;
        case 'SHORT_BREAK':
          return settings.shortBreakDuration * 60;
        case 'LONG_BREAK':
          return settings.longBreakDuration * 60;
        default:
          throw new Error(`Unknown focus session type: ${type}`);
      }
    }

    async function saveSessions(sessions: FocusSession[]): Promise<void> {
      try {
        await firstValueFrom(focusService.saveSessions(sessions));
        patchState(store, { error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        patchState(store, { error: 'Failed to save focus data' });
        console.error('FocusStore.saveSessions failed:', message);
      }
    }

    async function saveSettings(settings: FocusSettings): Promise<void> {
      try {
        await firstValueFrom(focusService.saveSettings(settings));
        patchState(store, { error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        patchState(store, { error: 'Failed to save focus settings' });
        console.error('FocusStore.saveSettings failed:', message);
      }
    }

    function notifyTimerComplete(completedType: FocusSessionType): void {
      // Browser notification (SSR-safe)
      if ('Notification' in window && Notification.permission === 'granted') {
        let title: string;
        let body: string;

        if (completedType === 'WORK') {
          title = 'Focus Session Complete';
          body = 'Time for a break! Great work.';
        } else if (completedType === 'SHORT_BREAK') {
          title = 'Break Over';
          body = 'Ready to focus again?';
        } else {
          title = 'Long Break Over';
          body = 'Ready for another round?';
        }

        new Notification(title, { body });
      }

      // Audio chime via Web Audio API
      try {
        const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        gainNode.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(800, ctx.currentTime);
        osc1.connect(gainNode);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.15);

        const osc2 = ctx.createOscillator();
        osc2.frequency.setValueAtTime(1000, ctx.currentTime + 0.15);
        osc2.connect(gainNode);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.30);

        osc2.onended = () => ctx.close();
      } catch {
        // AudioContext unavailable (e.g. test environment) — silently ignore
      }
    }

    function onTimerComplete(): void {
      const timerType = store.timerType();
      const sessionStart = store.currentSessionStart();

      if (timerType === 'WORK') {
        // Save completed work session
        const now = new Date().toISOString();
        const startTime = sessionStart ?? now;
        const plannedDuration = store.settings().workDuration;
        const session: FocusSession = {
          id: crypto.randomUUID(),
          taskId: store.linkedTaskId(),
          taskTitle: store.linkedTaskTitle(),
          startTime,
          plannedDuration,
          actualDuration: plannedDuration,
          completed: true,
          type: 'WORK',
        };
        const newSessions = [...store.sessions(), session];
        const newSessionsCompleted = store.sessionsCompleted() + 1;

        // Determine next break type
        const sessionsBeforeLong = store.settings().sessionsBeforeLongBreak;
        const nextType: FocusSessionType =
          newSessionsCompleted % sessionsBeforeLong === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';

        patchState(store, {
          sessions: newSessions,
          sessionsCompleted: newSessionsCompleted,
          timerStatus: 'IDLE',
          timerType: nextType,
          remainingSeconds: 0,
          currentSessionStart: null,
        });

        saveSessions(newSessions);

        // Auto-start break if enabled
        if (store.settings().autoStartBreaks) {
          startBreak(nextType);
        }
      } else {
        // Break completed — transition to WORK
        patchState(store, {
          timerStatus: 'IDLE',
          timerType: 'WORK',
          remainingSeconds: 0,
          currentSessionStart: null,
        });

        // Auto-start work if enabled
        if (store.settings().autoStartWork) {
          startTimer();
        }
      }

      notifyTimerComplete(timerType);
    }

    function tick(): void {
      const remaining = store.remainingSeconds();
      if (remaining <= 1) {
        clearTimerInterval();
        patchState(store, { remainingSeconds: 0 });
        onTimerComplete();
      } else {
        patchState(store, { remainingSeconds: remaining - 1 });
      }
    }

    function startTimer(): void {
      clearTimerInterval();
      const duration = getDurationForType('WORK');
      patchState(store, {
        timerStatus: 'RUNNING',
        timerType: 'WORK',
        remainingSeconds: duration,
        currentSessionStart: new Date().toISOString(),
      });
      startInterval();
    }

    function startBreak(type: FocusSessionType): void {
      clearTimerInterval();
      const duration = getDurationForType(type);
      patchState(store, {
        timerStatus: 'RUNNING',
        timerType: type,
        remainingSeconds: duration,
        currentSessionStart: new Date().toISOString(),
      });
      startInterval();
    }

    return {
      async loadData(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const [sessions, settings] = await Promise.all([
            firstValueFrom(focusService.loadSessions()),
            firstValueFrom(focusService.loadSettings()),
          ]);
          patchState(store, {
            sessions: [...sessions],
            settings,
            loading: false,
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          patchState(store, { error: 'Failed to load focus data', loading: false });
          console.error('FocusStore.loadData failed:', message);
        }
      },

      startTimer,

      startBreak,

      pauseTimer(): void {
        clearTimerInterval();
        patchState(store, { timerStatus: 'PAUSED' });
      },

      resumeTimer(): void {
        patchState(store, { timerStatus: 'RUNNING' });
        startInterval();
      },

      stopTimer(): void {
        clearTimerInterval();

        // Save partial session if it was a work session
        const timerType = store.timerType();
        if (timerType === 'WORK' && store.currentSessionStart()) {
          const startTime = store.currentSessionStart()!;
          const plannedDuration = store.settings().workDuration;
          const elapsed = plannedDuration * 60 - store.remainingSeconds();
          const actualMinutes = Math.round(elapsed / 60);

          const session: FocusSession = {
            id: crypto.randomUUID(),
            taskId: store.linkedTaskId(),
            taskTitle: store.linkedTaskTitle(),
            startTime,
            plannedDuration,
            actualDuration: actualMinutes,
            completed: false,
            type: 'WORK',
          };
          const newSessions = [...store.sessions(), session];
          patchState(store, {
            sessions: newSessions,
            timerStatus: 'IDLE',
            remainingSeconds: 0,
            currentSessionStart: null,
          });
          saveSessions(newSessions);
        } else {
          patchState(store, {
            timerStatus: 'IDLE',
            remainingSeconds: 0,
            currentSessionStart: null,
          });
        }
      },

      tick,

      linkTask(taskId: string, taskTitle: string): void {
        patchState(store, { linkedTaskId: taskId, linkedTaskTitle: taskTitle });
      },

      unlinkTask(): void {
        patchState(store, { linkedTaskId: null, linkedTaskTitle: null });
      },

      async updateSettings(updates: Partial<FocusSettings>): Promise<void> {
        const newSettings: FocusSettings = { ...store.settings(), ...updates };
        patchState(store, { settings: newSettings });
        await saveSettings(newSettings);
      },

      async requestNotificationPermission(): Promise<void> {
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      },
    };
  }),
);
