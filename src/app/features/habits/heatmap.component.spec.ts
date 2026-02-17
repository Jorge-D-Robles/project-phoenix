import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeatmapComponent } from './heatmap.component';
import { HabitLog } from '../../data/models/habit.model';

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

  describe('rendering', () => {
    it('should render a heatmap grid container', async () => {
      const fixture = await setup();
      const grid = fixture.debugElement.query(By.css('[data-testid="heatmap-grid"]'));
      expect(grid).toBeTruthy();
    });

    it('should render 364 cells (52 weeks x 7 days)', async () => {
      const fixture = await setup();
      const cells = fixture.debugElement.queryAll(By.css('app-heatmap-cell'));
      expect(cells.length).toBe(364);
    });

    it('should render all cells at level 0 when logs are empty', async () => {
      const fixture = await setup([]);
      const cells = fixture.debugElement.queryAll(By.css('.cell'));
      cells.forEach(cell => {
        expect(cell.nativeElement.getAttribute('data-level')).toBe('0');
      });
    });

    it('should render cells with appropriate levels when logs are provided', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const logs: HabitLog[] = [
        { habitId: 'h1', date: todayStr, value: 5 },
      ];

      const fixture = await setup(logs);
      const cells = fixture.debugElement.queryAll(By.css('.cell'));

      // At least one cell should have a non-zero level
      const nonZeroCells = cells.filter(
        c => c.nativeElement.getAttribute('data-level') !== '0',
      );
      expect(nonZeroCells.length).toBeGreaterThan(0);
    });

    it('should be wrapped in a scrollable container', async () => {
      const fixture = await setup();
      const wrapper = fixture.debugElement.query(By.css('[data-testid="heatmap-wrapper"]'));
      expect(wrapper).toBeTruthy();
    });
  });

  describe('month labels', () => {
    it('should render month labels', async () => {
      const fixture = await setup();
      const labels = fixture.debugElement.query(By.css('[data-testid="month-labels"]'));
      expect(labels).toBeTruthy();
    });

    it('should render between 12 and 14 month labels for a full year', async () => {
      const fixture = await setup();
      const labels = fixture.debugElement.queryAll(By.css('.month-label'));
      // 52 weeks spans ~12-13 months, so we expect 12-14 labels
      expect(labels.length).toBeGreaterThanOrEqual(12);
      expect(labels.length).toBeLessThanOrEqual(14);
    });

    it('should have three-letter month abbreviations', async () => {
      const fixture = await setup();
      const labels = fixture.debugElement.queryAll(By.css('.month-label'));
      const validMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      for (const label of labels) {
        const text = label.nativeElement.textContent.trim();
        expect(validMonths).toContain(text);
      }
    });
  });

  describe('cells data', () => {
    it('should include weekIndex in each cell', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      expect(cells.length).toBe(364);
      // First 7 cells should be week 0
      for (let i = 0; i < 7; i++) {
        expect(cells[i].weekIndex).toBe(0);
      }
      // Next 7 cells should be week 1
      for (let i = 7; i < 14; i++) {
        expect(cells[i].weekIndex).toBe(1);
      }
    });

    it('should include date strings in YYYY-MM-DD format', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      for (const cell of cells) {
        expect(cell.date).toMatch(datePattern);
      }
    });

    it('should mark some cells as monthStart for month boundaries', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      // Count unique weeks that are month boundaries
      const monthStartWeeks = new Set(cells.filter(c => c.monthStart).map(c => c.weekIndex));
      // 52 weeks spans ~12 month boundaries (first week excluded)
      expect(monthStartWeeks.size).toBeGreaterThanOrEqual(11);
      expect(monthStartWeeks.size).toBeLessThanOrEqual(13);
    });

    it('should not mark first week as monthStart', async () => {
      const fixture = await setup();
      const cells = fixture.componentInstance.cells();
      const firstWeekCells = cells.filter(c => c.weekIndex === 0);
      for (const cell of firstWeekCells) {
        expect(cell.monthStart).toBe(false);
      }
    });
  });
});
