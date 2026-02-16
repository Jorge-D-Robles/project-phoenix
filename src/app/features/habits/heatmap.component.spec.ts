import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HeatmapComponent } from './heatmap.component';
import { HabitLog } from '../../data/models/habit.model';

describe('HeatmapComponent', () => {
  async function setup(logs: HabitLog[] = []) {
    await TestBed.configureTestingModule({
      imports: [HeatmapComponent],
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
  });
});
