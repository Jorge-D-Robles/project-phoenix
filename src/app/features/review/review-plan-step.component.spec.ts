import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewPlanStepComponent } from './review-plan-step.component';

describe('ReviewPlanStepComponent', () => {
  let fixture: ComponentFixture<ReviewPlanStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewPlanStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewPlanStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render plan textarea', () => {
    const textarea = fixture.nativeElement.querySelector('[data-testid="plan-textarea"]');
    expect(textarea).toBeTruthy();
  });
});
