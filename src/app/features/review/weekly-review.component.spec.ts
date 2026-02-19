import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { WeeklyReviewComponent } from './weekly-review.component';

describe('WeeklyReviewComponent', () => {
  let fixture: ComponentFixture<WeeklyReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyReviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyReviewComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render review stepper', () => {
    const stepper = fixture.nativeElement.querySelector('[data-testid="review-stepper"]');
    expect(stepper).toBeTruthy();
  });

  it('should show tasks step initially', () => {
    const tasksStep = fixture.nativeElement.querySelector('[data-testid="review-tasks-step"]');
    expect(tasksStep).toBeTruthy();
  });
});
