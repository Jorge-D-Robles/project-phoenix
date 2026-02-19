import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewSummaryStepComponent } from './review-summary-step.component';

describe('ReviewSummaryStepComponent', () => {
  let fixture: ComponentFixture<ReviewSummaryStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewSummaryStepComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSummaryStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render productivity score', () => {
    const score = fixture.nativeElement.querySelector('[data-testid="score"]');
    expect(score).toBeTruthy();
  });

  it('should render summary stats', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="summary-tasks"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="summary-habits"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="summary-focus"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="summary-events"]')).toBeTruthy();
  });
});
