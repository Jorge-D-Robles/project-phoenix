import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewHabitsStepComponent } from './review-habits-step.component';

describe('ReviewHabitsStepComponent', () => {
  let fixture: ComponentFixture<ReviewHabitsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewHabitsStepComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewHabitsStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render habit consistency', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="habit-consistency"]');
    expect(el).toBeTruthy();
  });
});
