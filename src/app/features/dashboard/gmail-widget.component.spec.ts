import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GmailWidgetComponent } from './gmail-widget.component';

describe('GmailWidgetComponent', () => {
  let fixture: ComponentFixture<GmailWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GmailWidgetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GmailWidgetComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render gmail card', () => {
    const card = fixture.nativeElement.querySelector('[data-testid="gmail-card"]');
    expect(card).toBeTruthy();
  });

  it('should show empty state when no messages', () => {
    const empty = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(empty?.textContent).toContain('No unread messages');
  });
});
