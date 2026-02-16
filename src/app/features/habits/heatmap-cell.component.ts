import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-heatmap-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="cell" [attr.data-level]="level()"></div>`,
  styles: [`
    .cell { width: 12px; height: 12px; border-radius: 2px; }
    .cell[data-level="0"] { background: var(--heatmap-empty, #ebedf0); }
    .cell[data-level="1"] { background: var(--heatmap-low, #9be9a8); }
    .cell[data-level="2"] { background: var(--heatmap-med, #40c463); }
    .cell[data-level="3"] { background: var(--heatmap-high, #30a14e); }
    .cell[data-level="4"] { background: var(--heatmap-peak, #216e39); }
  `],
})
export class HeatmapCellComponent {
  level = input.required<number>();
}
