import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-heatmap-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltipModule],
  template: `
    <div class="cell"
         [attr.data-level]="level()"
         [matTooltip]="tooltip()"
         matTooltipPosition="above">
    </div>
  `,
  styles: [`
    .cell { width: 12px; height: 12px; border-radius: 2px; cursor: default; }
    .cell[data-level="0"] { background: var(--heatmap-empty, #ebedf0); }
    .cell[data-level="1"] { background: var(--heatmap-low, #9be9a8); }
    .cell[data-level="2"] { background: var(--heatmap-med, #40c463); }
    .cell[data-level="3"] { background: var(--heatmap-high, #30a14e); }
    .cell[data-level="4"] { background: var(--heatmap-peak, #216e39); }
  `],
})
export class HeatmapCellComponent {
  level = input.required<number>();
  date = input<string>('');

  tooltip = computed(() => {
    const d = this.date();
    if (!d) return '';
    const parsed = new Date(d + 'T00:00:00');
    const day = DAYS[parsed.getDay()];
    const month = MONTHS[parsed.getMonth()];
    const dateNum = parsed.getDate();
    const year = parsed.getFullYear();
    const lvl = this.level();
    const activity = lvl === 0 ? 'No activity' : `Level ${lvl}`;
    return `${activity} on ${day}, ${month} ${dateNum}, ${year}`;
  });
}
