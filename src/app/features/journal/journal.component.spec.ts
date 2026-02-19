import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { JournalComponent } from './journal.component';

describe('JournalComponent', () => {
  let fixture: ComponentFixture<JournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render entries list', () => {
    const list = fixture.nativeElement.querySelector('[data-testid="entries-list"]');
    expect(list).toBeTruthy();
  });

  it('should render editor card', () => {
    const editor = fixture.nativeElement.querySelector('[data-testid="editor-card"]');
    expect(editor).toBeTruthy();
  });

  it('should render today button', () => {
    const btn = fixture.nativeElement.querySelector('[data-testid="today-btn"]');
    expect(btn).toBeTruthy();
  });
});
