import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { JournalWidgetComponent } from './journal-widget.component';

describe('JournalWidgetComponent', () => {
  let fixture: ComponentFixture<JournalWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalWidgetComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalWidgetComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render journal card', () => {
    const card = fixture.nativeElement.querySelector('[data-testid="journal-card"]');
    expect(card).toBeTruthy();
  });

  it('should render quick entry textarea', () => {
    const textarea = fixture.nativeElement.querySelector('[data-testid="journal-quick-entry"]');
    expect(textarea).toBeTruthy();
  });
});
