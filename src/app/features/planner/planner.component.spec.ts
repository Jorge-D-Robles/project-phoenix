import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PlannerComponent } from './planner.component';

describe('PlannerComponent', () => {
  let fixture: ComponentFixture<PlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlannerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render task sidebar', () => {
    const sidebar = fixture.nativeElement.querySelector('[data-testid="task-sidebar"]');
    expect(sidebar).toBeTruthy();
  });

  it('should render day timeline', () => {
    const timeline = fixture.nativeElement.querySelector('[data-testid="day-timeline"]');
    expect(timeline).toBeTruthy();
  });

  it('should render today button', () => {
    const btn = fixture.nativeElement.querySelector('[data-testid="today-btn"]');
    expect(btn).toBeTruthy();
  });

  it('should render date picker', () => {
    const picker = fixture.nativeElement.querySelector('[data-testid="date-picker"]');
    expect(picker).toBeTruthy();
  });
});
