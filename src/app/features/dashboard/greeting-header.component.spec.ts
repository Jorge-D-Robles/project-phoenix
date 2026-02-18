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
    it('should display greeting, date, and summary', async () => {
      const fixture = await setup();
      expect(fixture.debugElement.query(By.css('[data-testid="greeting-text"]')).nativeElement.textContent).toContain('Good morning, Test');
      expect(fixture.debugElement.query(By.css('[data-testid="date-text"]')).nativeElement.textContent).toContain('Monday, February 16, 2026');
      expect(fixture.debugElement.query(By.css('[data-testid="summary-text"]')).nativeElement.textContent).toContain('3 of 5 tasks');
    });

    it('should render the progress ring', async () => {
      const fixture = await setup();
      const ring = fixture.debugElement.query(By.css('[data-testid="progress-ring"]'));
      expect(ring).toBeTruthy();
    });

    it('should show zero state when no tasks', async () => {
      const fixture = await setup({ summary: { done: 0, total: 0, percentage: 0 } });
      const el = fixture.debugElement.query(By.css('[data-testid="summary-text"]'));
      expect(el.nativeElement.textContent).toContain('0 of 0 tasks');
    });
  });

  describe('progress ring color', () => {
    it('should use green stroke when percentage >= 70', async () => {
      const fixture = await setup({ summary: { done: 7, total: 10, percentage: 70 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      expect(arc.nativeElement.getAttribute('stroke')).toBe('#22c55e');
    });

    it('should use green stroke when percentage is 100', async () => {
      const fixture = await setup({ summary: { done: 10, total: 10, percentage: 100 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      expect(arc.nativeElement.getAttribute('stroke')).toBe('#22c55e');
    });

    it('should use yellow stroke when percentage >= 40 and < 70', async () => {
      const fixture = await setup({ summary: { done: 4, total: 10, percentage: 40 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      expect(arc.nativeElement.getAttribute('stroke')).toBe('#eab308');
    });

    it('should use yellow stroke when percentage is 60', async () => {
      const fixture = await setup({ summary: MOCK_SUMMARY });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      expect(arc.nativeElement.getAttribute('stroke')).toBe('#eab308');
    });

    it('should use red stroke when percentage < 40', async () => {
      const fixture = await setup({ summary: { done: 1, total: 10, percentage: 10 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      expect(arc.nativeElement.getAttribute('stroke')).toBe('#ef4444');
    });

    it('should use red stroke when percentage is 0', async () => {
      const fixture = await setup({ summary: { done: 0, total: 0, percentage: 0 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      expect(arc.nativeElement.getAttribute('stroke')).toBe('#ef4444');
    });
  });

  describe('stroke dash offset', () => {
    it('should set stroke-dashoffset to 0 when percentage is 100', async () => {
      const fixture = await setup({ summary: { done: 10, total: 10, percentage: 100 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      const offset = parseFloat(arc.nativeElement.getAttribute('stroke-dashoffset'));
      expect(offset).toBeCloseTo(0, 1);
    });

    it('should set stroke-dashoffset to full circumference when percentage is 0', async () => {
      const fixture = await setup({ summary: { done: 0, total: 0, percentage: 0 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      const circumference = 2 * Math.PI * 40;
      const offset = parseFloat(arc.nativeElement.getAttribute('stroke-dashoffset'));
      expect(offset).toBeCloseTo(circumference, 1);
    });

    it('should set stroke-dashoffset to half circumference when percentage is 50', async () => {
      const fixture = await setup({ summary: { done: 5, total: 10, percentage: 50 } });
      const arc = fixture.debugElement.query(By.css('[data-testid="progress-arc"]'));
      const circumference = 2 * Math.PI * 40;
      const offset = parseFloat(arc.nativeElement.getAttribute('stroke-dashoffset'));
      expect(offset).toBeCloseTo(circumference * 0.5, 1);
    });
  });
});
