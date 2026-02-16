import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GreetingHeaderComponent } from './greeting-header.component';
import type { CompletionSummary } from '../../state/dashboard.store';

const MOCK_SUMMARY: CompletionSummary = { done: 3, total: 5, percentage: 60 };

describe('GreetingHeaderComponent', () => {
  async function setup(overrides: {
    greeting?: string;
    date?: string;
    summary?: CompletionSummary;
  } = {}) {
    await TestBed.configureTestingModule({
      imports: [GreetingHeaderComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(GreetingHeaderComponent);
    fixture.componentRef.setInput('greeting', overrides.greeting ?? 'Good morning, Test');
    fixture.componentRef.setInput('date', overrides.date ?? 'Monday, February 16, 2026');
    fixture.componentRef.setInput('summary', overrides.summary ?? MOCK_SUMMARY);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should display the greeting text', async () => {
      const fixture = await setup();
      const el = fixture.debugElement.query(By.css('[data-testid="greeting-text"]'));
      expect(el.nativeElement.textContent).toContain('Good morning, Test');
    });

    it('should display the date', async () => {
      const fixture = await setup();
      const el = fixture.debugElement.query(By.css('[data-testid="date-text"]'));
      expect(el.nativeElement.textContent).toContain('Monday, February 16, 2026');
    });

    it('should display the summary text', async () => {
      const fixture = await setup();
      const el = fixture.debugElement.query(By.css('[data-testid="summary-text"]'));
      expect(el.nativeElement.textContent).toContain('3 of 5 tasks');
    });

    it('should render the progress bar', async () => {
      const fixture = await setup();
      const bar = fixture.debugElement.query(By.css('[data-testid="progress-bar"]'));
      expect(bar).toBeTruthy();
    });

    it('should show zero state when no tasks', async () => {
      const fixture = await setup({ summary: { done: 0, total: 0, percentage: 0 } });
      const el = fixture.debugElement.query(By.css('[data-testid="summary-text"]'));
      expect(el.nativeElement.textContent).toContain('0 of 0 tasks');
    });
  });
});
