import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewTasksStepComponent } from './review-tasks-step.component';

describe('ReviewTasksStepComponent', () => {
  let fixture: ComponentFixture<ReviewTasksStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewTasksStepComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewTasksStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render tasks completed stat', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="tasks-completed"]');
    expect(el).toBeTruthy();
  });

  it('should render pending count', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="tasks-pending"]');
    expect(el).toBeTruthy();
  });
});
