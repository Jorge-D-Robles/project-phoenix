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
         [class.month-start]="monthStart()"
         [attr.data-level]="level()"
         [matTooltip]="tooltip()"
         matTooltipPosition="above">
    </div>
  `,
  styles: [`
    :host { display: contents; }

    /* Light mode colors (default) */
    .cell { width: 12px; height: 12px; border-radius: 2px; cursor: default; }
    .cell[data-level="0"] { background: #ebedf0; }
    .cell[data-level="1"] { background: #9be9a8; }
    .cell[data-level="2"] { background: #40c463; }
    .cell[data-level="3"] { background: #30a14e; }
    .cell[data-level="4"] { background: #216e39; }

    /* Dark mode colors */
    :host-context(body.dark) .cell[data-level="0"] { background: #161b22; }
    :host-context(body.dark) .cell[data-level="1"] { background: #0e4429; }
    :host-context(body.dark) .cell[data-level="2"] { background: #006d32; }
    :host-context(body.dark) .cell[data-level="3"] { background: #26a641; }
    :host-context(body.dark) .cell[data-level="4"] { background: #39d353; }

    /* Month divider — left border on the first column of a new month */
    .cell.month-start {
      border-left: 2px solid rgba(0, 0, 0, 0.1);
      margin-left: 1px;
    }
    :host-context(body.dark) .cell.month-start {
      border-left-color: rgba(255, 255, 255, 0.12);
    }
  `],
})
export class HeatmapCellComponent {
  level = input.required<number>();
  date = input<string>('');
  monthStart = input<boolean>(false);

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
