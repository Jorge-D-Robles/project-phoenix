import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HeatmapCellComponent } from './heatmap-cell.component';

describe('HeatmapCellComponent', () => {
  async function setup(level: number) {
    await TestBed.configureTestingModule({
      imports: [HeatmapCellComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeatmapCellComponent);
    fixture.componentRef.setInput('level', level);
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
});
