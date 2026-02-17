import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeatmapCellComponent } from './heatmap-cell.component';

describe('HeatmapCellComponent', () => {
  async function setup(level: number, date = '', monthStart = false, isFuture = false) {
    await TestBed.configureTestingModule({
      imports: [HeatmapCellComponent, NoopAnimationsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeatmapCellComponent);
    fixture.componentRef.setInput('level', level);
    if (date) {
      fixture.componentRef.setInput('date', date);
    }
    fixture.componentRef.setInput('monthStart', monthStart);
    fixture.componentRef.setInput('isFuture', isFuture);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should render a cell with background color for level 0', async () => {
      const fixture = await setup(0);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell).toBeTruthy();
      expect(cell.nativeElement.style.backgroundColor).toBeTruthy();
    });

    it('should render different background colors for different levels', async () => {
      const colors: string[] = [];
      for (const level of [0, 1, 2, 3, 4]) {
        const fixture = await setup(level);
        const cell = fixture.debugElement.query(By.css('.cell'));
        colors.push(cell.nativeElement.style.backgroundColor);
        TestBed.resetTestingModule();
      }
      // All 5 levels should have distinct colors
      const unique = new Set(colors);
      expect(unique.size).toBe(5);
    });

    it('should render transparent background for future cells', async () => {
      const fixture = await setup(-1, '2099-01-01', false, true);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.style.backgroundColor).toBe('transparent');
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

    it('should return empty string for future cells', async () => {
      const fixture = await setup(-1, '2099-01-01', false, true);
      expect(fixture.componentInstance.tooltip()).toBe('');
    });
  });

  describe('month divider', () => {
    it('should add month-start class when monthStart is true', async () => {
      const fixture = await setup(0, '2026-03-01', true);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.classList.contains('month-start')).toBe(true);
    });

    it('should not add month-start class when monthStart is false', async () => {
      const fixture = await setup(0, '2026-03-15', false);
      const cell = fixture.debugElement.query(By.css('.cell'));
      expect(cell.nativeElement.classList.contains('month-start')).toBe(false);
    });
  });
});
