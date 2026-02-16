import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'phoenix-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(this.loadInitialTheme());

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
    localStorage.setItem(THEME_KEY, JSON.stringify(next));
  }

  /** Apply the current theme to the DOM on startup. */
  init(): void {
    this.applyTheme(this.isDark());
  }

  private loadInitialTheme(): boolean {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean): void {
    document.body.classList.toggle('dark', dark);
  }
}
