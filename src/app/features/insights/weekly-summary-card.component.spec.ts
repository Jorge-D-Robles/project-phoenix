import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeeklySummaryCardComponent } from './weekly-summary-card.component';
import type { WeekSummary } from '../../state/insights.store';

describe('WeeklySummaryCardComponent', () => {
  let fixture: ComponentFixture<WeeklySummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklySummaryCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklySummaryCardComponent);
  });

  describe('rendering', () => {
    const summary: WeekSummary = {
      tasksCompleted: 12,
      habitsLogged: 8,
      focusMinutes: 150,
      eventsAttended: 5,
      productivityScore: 72,
    };

    it('should display tasks completed', async () => {
      fixture.componentRef.setInput('summary', summary);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('12');
    });

    it('should display habits logged', async () => {
      fixture.componentRef.setInput('summary', summary);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('8');
    });

    it('should display focus minutes', async () => {
      fixture.componentRef.setInput('summary', summary);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('150');
    });

    it('should display events attended', async () => {
      fixture.componentRef.setInput('summary', summary);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('5');
    });

    it('should render 4 stat cards', async () => {
      fixture.componentRef.setInput('summary', summary);
      await fixture.whenStable();

      const cards = fixture.nativeElement.querySelectorAll('[data-testid="stat-card"]');
      expect(cards.length).toBe(4);
    });

    it('should render icons for each stat', async () => {
      fixture.componentRef.setInput('summary', summary);
      await fixture.whenStable();

      const icons = fixture.nativeElement.querySelectorAll('mat-icon');
      expect(icons.length).toBe(4);
    });
  });
});
