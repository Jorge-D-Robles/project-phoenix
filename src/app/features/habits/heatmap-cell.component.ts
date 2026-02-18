import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../core/theme.service';
import { SHORT_MONTHS, SHORT_DAYS } from '../../shared/date.utils';

/** Light mode level colors (GitHub-style greens) */
export const LIGHT_COLORS: Record<number, string> = {
  0: '#ebedf0',
  1: '#9be9a8',
  2: '#40c463',
  3: '#30a14e',
  4: '#216e39',
};

/** Dark mode level colors */
export const DARK_COLORS: Record<number, string> = {
  0: '#161b22',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

@Component({
  selector: 'app-heatmap-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltipModule],
  template: `
    <div class="cell"
         [class.month-start]="monthStart()"
         [class.today]="isToday()"
         [style.backgroundColor]="bgColor()"
         [matTooltip]="tooltip()"
         matTooltipPosition="above">
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .cell {
      position: relative;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      cursor: default;
    }

    .cell.today {
      outline: 2px solid #8ab4f8;
      outline-offset: -1px;
    }

    .cell.month-start::before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: currentColor;
      opacity: 0.15;
    }
  `],
})
export class HeatmapCellComponent {
  private readonly themeService = inject(ThemeService);

  readonly level = input.required<number>();
  readonly date = input<string>('');
  readonly monthStart = input<boolean>(false);
  readonly isToday = input<boolean>(false);
  readonly isFuture = input<boolean>(false);

  readonly bgColor = computed(() => {
    if (this.isFuture()) return 'transparent';
    const lvl = this.level();
    const palette = this.themeService.isDark() ? DARK_COLORS : LIGHT_COLORS;
    return palette[lvl] ?? palette[0];
  });

  readonly tooltip = computed(() => {
    const d = this.date();
    if (!d || this.isFuture()) return '';
    const parsed = new Date(d + 'T00:00:00');
    const day = SHORT_DAYS[parsed.getDay()];
    const month = SHORT_MONTHS[parsed.getMonth()];
    const dateNum = parsed.getDate();
    const year = parsed.getFullYear();
    const lvl = this.level();
    const activity = lvl === 0 ? 'No activity' : `Level ${lvl}`;
    return `${activity} on ${day}, ${month} ${dateNum}, ${year}`;
  });
}
