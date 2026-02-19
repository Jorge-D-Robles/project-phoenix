import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewCalendarStepComponent } from './review-calendar-step.component';

describe('ReviewCalendarStepComponent', () => {
  let fixture: ComponentFixture<ReviewCalendarStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCalendarStepComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewCalendarStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render events attended', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="events-attended"]');
    expect(el).toBeTruthy();
  });
});
