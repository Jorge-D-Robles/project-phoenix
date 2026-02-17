import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeatmapComponent } from './heatmap.component';
import { HabitLog } from '../../data/models/habit.model';

/** Format a Date as YYYY-MM-DD (same logic as the component) */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('HeatmapComponent', () => {
  async function setup(logs: HabitLog[] = []) {
    await TestBed.configureTestingModule({
      imports: [HeatmapComponent, NoopAnimationsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeatmapComponent);
    fixture.componentRef.setInput('logs', logs);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('grid structure', () => {
    it('should render 364 cells in a scrollable grid', async () => {
      const fixture = await setup();
      const wrapper = fixture.debugElement.query(By.css('[data-testid="heatmap-wrapper"]'));
      const grid = fixture.debugElement.query(By.css('[data-testid="heatmap-grid"]'));
      const cells = fixture.debugElement.queryAll(By.css('app-heatmap-cell'));
      expect(wrapper).toBeTruthy();
      expect(grid).toBeTruthy();
      expect(cells.length).toBe(364);
    });

    it('should align grid to Sunday boundaries (first cell is a Sunday)', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const firstDate = new Date(cells[0].date + 'T00:00:00');
      expect(firstDate.getDay()).toBe(0);
    });

    it('should end on today (today is the last non-future cell)', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const todayStr = formatDate(new Date());
      const todayCell = cells.find(c => c.isToday);
      expect(todayCell).toBeTruthy();
      expect(todayCell!.date).toBe(todayStr);
      // Every cell after today is future
      const todayIdx = cells.indexOf(todayCell!);
      for (let i = todayIdx + 1; i < cells.length; i++) {
        expect(cells[i].isFuture).withContext(`cell ${i} (${cells[i].date}) should be future`).toBeTrue();
      }
    });
  });

  describe('habit activity visualization', () => {
    it('should assign level 4 to cells with logged activity when there is one log value', async () => {
      const todayStr = formatDate(new Date());
      const logs: HabitLog[] = [{ habitId: 'h1', date: todayStr, value: 1 }];

      const fixture = await setup(logs);
      const cells = fixture.componentInstance.cells();
      const todayCell = cells.find(c => c.date === todayStr);

      expect(todayCell).toBeTruthy();
      expect(todayCell!.level).toBe(4); // max activity → level 4
    });

    it('should visually distinguish active days from inactive days in the DOM', async () => {
      const today = new Date();
      const todayStr = formatDate(today);
      const logs: HabitLog[] = [{ habitId: 'h1', date: todayStr, value: 3 }];

      const fixture = await setup(logs);
      const cellEls = fixture.debugElement.queryAll(By.css('.cell'));

      // Collect all unique background colors
      const bgColors = new Set<string>();
      let activeBg = '';
      const cells = fixture.componentInstance.cells();

      for (let i = 0; i < cellEls.length; i++) {
        const bg = cellEls[i].nativeElement.style.backgroundColor;
        bgColors.add(bg);
        if (cells[i].date === todayStr) {
          activeBg = bg;
        }
      }

      // There must be at least 2 distinct colors (active vs inactive vs future)
      expect(bgColors.size).withContext('heatmap should have multiple distinct colors').toBeGreaterThanOrEqual(2);
      // The active cell's background must differ from the empty cell background
      const inactiveBg = cellEls[0].nativeElement.style.backgroundColor;
      expect(activeBg).withContext('active day should differ from inactive day').not.toBe(inactiveBg);
    });

    it('should show graduated levels for varying activity amounts', async () => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = 0; i < 4; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(formatDate(d));
      }
      // 4 logs with values 4, 3, 2, 1 (today=4, yesterday=3, etc.)
      const logs: HabitLog[] = dates.map((date, i) => ({
        habitId: 'h1', date, value: 4 - i,
      }));

      const fixture = await setup(logs);
      const cells = fixture.componentInstance.cells();

      const levels = dates.map(date => cells.find(c => c.date === date)!.level);
      // Level 4 for highest, then decreasing
      expect(levels[0]).toBe(4); // value 4 / max 4 = 1.0 → level 4
      expect(levels[1]).toBe(3); // value 3 / max 4 = 0.75 → level 3
      expect(levels[2]).toBe(2); // value 2 / max 4 = 0.5 → level 2
      expect(levels[3]).toBe(1); // value 1 / max 4 = 0.25 → level 1
    });

    it('should render future cells as transparent', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const cellEls = fixture.debugElement.queryAll(By.css('.cell'));

      // Find a future cell
      const futureIdx = cells.findIndex(c => c.isFuture);
      if (futureIdx >= 0) {
        const futureBg = cellEls[futureIdx].nativeElement.style.backgroundColor;
        expect(futureBg).toBe('transparent');
      }
    });
  });

  describe('month labels', () => {
    it('should render 3-letter month labels with no overlapping', async () => {
      const fixture = await setup();
      const labels = fixture.debugElement.queryAll(By.css('.month-label'));
      const validMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      expect(labels.length).toBeGreaterThanOrEqual(11);
      expect(labels.length).toBeLessThanOrEqual(14);

      for (const label of labels) {
        expect(validMonths).toContain(label.nativeElement.textContent.trim());
      }

      // Verify column gap: labels must be at least 3 columns apart
      const monthLabelData = fixture.componentInstance.monthLabels();
      for (let i = 1; i < monthLabelData.length; i++) {
        const gap = monthLabelData[i].column - monthLabelData[i - 1].column;
        expect(gap).withContext(`gap between ${monthLabelData[i-1].name} and ${monthLabelData[i].name}`).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('month dividers', () => {
    it('should mark cells at month boundaries with monthStart', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const monthStartWeeks = new Set(cells.filter(c => c.monthStart).map(c => c.weekIndex));
      expect(monthStartWeeks.size).toBeGreaterThanOrEqual(11);
      // First week should never be a month-start divider
      const firstWeekCells = cells.filter(c => c.weekIndex === 0);
      for (const cell of firstWeekCells) {
        expect(cell.monthStart).toBe(false);
      }
    });

    it('should apply month-start CSS class to month boundary cells', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const cellEls = fixture.debugElement.queryAll(By.css('.cell'));

      const monthStartIdx = cells.findIndex(c => c.monthStart);
      expect(monthStartIdx).toBeGreaterThan(-1);
      expect(cellEls[monthStartIdx].nativeElement.classList.contains('month-start')).toBeTrue();
    });
  });
});
