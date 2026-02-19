import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeBlockColumnComponent } from './time-block-column.component';

describe('TimeBlockColumnComponent', () => {
  let fixture: ComponentFixture<TimeBlockColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeBlockColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeBlockColumnComponent);
    fixture.componentRef.setInput('events', []);
    fixture.componentRef.setInput('timeBlocks', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render time column', () => {
    const col = fixture.nativeElement.querySelector('[data-testid="time-column"]');
    expect(col).toBeTruthy();
  });

  it('should render hour lines', () => {
    // 8am to 8pm = 12 hours
    const hourLines = fixture.nativeElement.querySelectorAll('.border-t');
    expect(hourLines.length).toBe(12);
  });

  it('should render time blocks when provided', () => {
    fixture.componentRef.setInput('timeBlocks', [{
      id: 'tb-1', taskId: null, title: 'Focus time',
      start: '2026-02-18T10:00:00', end: '2026-02-18T11:00:00', colorId: '7',
    }]);
    fixture.detectChanges();

    const blocks = fixture.nativeElement.querySelectorAll('[data-testid="time-block"]');
    expect(blocks.length).toBe(1);
    expect(blocks[0].textContent).toContain('Focus time');
  });
});
