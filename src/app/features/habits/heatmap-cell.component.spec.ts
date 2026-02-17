import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeatmapCellComponent } from './heatmap-cell.component';

describe('HeatmapCellComponent', () => {
  async function setup(level: number, date = '') {
    await TestBed.configureTestingModule({
      imports: [HeatmapCellComponent, NoopAnimationsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeatmapCellComponent);
    fixture.componentRef.setInput('level', level);
    if (date) {
      fixture.componentRef.setInput('date', date);
    }
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should render a cell with data-level="0" for level 0', async () => {
      const fixture = await setup(0);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell).toBeTruthy();
      expect(cell.nativeElement.getAttribute('data-level')).toBe('0');
    });

    it('should render a cell with data-level="1" for level 1', async () => {
      const fixture = await setup(1);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.getAttribute('data-level')).toBe('1');
    });

    it('should render a cell with data-level="2" for level 2', async () => {
      const fixture = await setup(2);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.getAttribute('data-level')).toBe('2');
    });

    it('should render a cell with data-level="3" for level 3', async () => {
      const fixture = await setup(3);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.getAttribute('data-level')).toBe('3');
    });

    it('should render a cell with data-level="4" for level 4', async () => {
      const fixture = await setup(4);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.getAttribute('data-level')).toBe('4');
    });
  });

  describe('tooltip', () => {
    it('should show "No activity" for level 0 with date', async () => {
      const fixture = await setup(0, '2026-02-16');
      expect(fixture.componentInstance.tooltip()).toBe('No activity on Mon, Feb 16, 2026');
    });

    it('should show "Level 3" for level 3 with date', async () => {
      const fixture = await setup(3, '2026-01-05');
      expect(fixture.componentInstance.tooltip()).toBe('Level 3 on Mon, Jan 5, 2026');
    });

    it('should return empty string when no date is provided', async () => {
      const fixture = await setup(2);
      expect(fixture.componentInstance.tooltip()).toBe('');
    });

    it('should include day of week and full date in tooltip', async () => {
      const fixture = await setup(4, '2026-06-15');
      const tip = fixture.componentInstance.tooltip();
      expect(tip).toContain('Mon');
      expect(tip).toContain('Jun 15, 2026');
      expect(tip).toContain('Level 4');
    });
  });
});
