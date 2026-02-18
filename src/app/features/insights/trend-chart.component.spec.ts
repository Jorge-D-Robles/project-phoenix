import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrendChartComponent } from './trend-chart.component';

describe('TrendChartComponent', () => {
  let fixture: ComponentFixture<TrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendChartComponent);
  });

  describe('rendering', () => {
    it('should render a bar for each data point', async () => {
      const data = [
        { label: 'Mon', value: 3 },
        { label: 'Tue', value: 7 },
        { label: 'Wed', value: 5 },
      ];
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('maxValue', 10);
      fixture.componentRef.setInput('title', 'Chart');
      fixture.componentRef.setInput('color', '#2196F3');
      await fixture.whenStable();

      const bars = fixture.nativeElement.querySelectorAll('[data-testid="chart-bar"]');
      expect(bars.length).toBe(3);
    });

    it('should show labels below bars', async () => {
      const data = [
        { label: 'Mon', value: 3 },
        { label: 'Tue', value: 7 },
      ];
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('maxValue', 10);
      fixture.componentRef.setInput('title', 'Chart');
      fixture.componentRef.setInput('color', '#2196F3');
      await fixture.whenStable();

      const labels = fixture.nativeElement.querySelectorAll('[data-testid="chart-label"]');
      expect(labels.length).toBe(2);
      expect(labels[0].textContent.trim()).toBe('Mon');
      expect(labels[1].textContent.trim()).toBe('Tue');
    });

    it('should set bar heights proportional to value/maxValue', async () => {
      const data = [{ label: 'A', value: 5 }];
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('maxValue', 10);
      fixture.componentRef.setInput('title', 'Chart');
      fixture.componentRef.setInput('color', '#FF5722');
      await fixture.whenStable();

      const bar = fixture.nativeElement.querySelector('[data-testid="chart-bar"]') as HTMLElement;
      expect(bar.style.height).toBe('50%');
    });

    it('should handle zero maxValue gracefully', async () => {
      const data = [{ label: 'A', value: 0 }];
      fixture.componentRef.setInput('data', data);
      fixture.componentRef.setInput('maxValue', 0);
      fixture.componentRef.setInput('title', 'Chart');
      fixture.componentRef.setInput('color', '#FF5722');
      await fixture.whenStable();

      const bar = fixture.nativeElement.querySelector('[data-testid="chart-bar"]') as HTMLElement;
      expect(bar.style.height).toBe('0%');
    });
  });
});
