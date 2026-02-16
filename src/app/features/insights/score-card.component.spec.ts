import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreCardComponent } from './score-card.component';

describe('ScoreCardComponent', () => {
  let fixture: ComponentFixture<ScoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreCardComponent);
  });

  describe('rendering', () => {
    it('should display the score value', async () => {
      fixture.componentRef.setInput('score', 75);
      fixture.componentRef.setInput('label', 'Productivity');
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('75');
    });

    it('should display the label', async () => {
      fixture.componentRef.setInput('score', 50);
      fixture.componentRef.setInput('label', 'Weekly Score');
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Weekly Score');
    });

    it('should apply green color class for score >= 70', async () => {
      fixture.componentRef.setInput('score', 85);
      fixture.componentRef.setInput('label', 'Score');
      await fixture.whenStable();

      const scoreEl = fixture.nativeElement.querySelector('[data-testid="score-value"]') as HTMLElement;
      expect(scoreEl.className).toContain('green');
    });

    it('should apply yellow color class for score 40-69', async () => {
      fixture.componentRef.setInput('score', 55);
      fixture.componentRef.setInput('label', 'Score');
      await fixture.whenStable();

      const scoreEl = fixture.nativeElement.querySelector('[data-testid="score-value"]') as HTMLElement;
      expect(scoreEl.className).toContain('yellow');
    });

    it('should apply red color class for score < 40', async () => {
      fixture.componentRef.setInput('score', 20);
      fixture.componentRef.setInput('label', 'Score');
      await fixture.whenStable();

      const scoreEl = fixture.nativeElement.querySelector('[data-testid="score-value"]') as HTMLElement;
      expect(scoreEl.className).toContain('red');
    });

    it('should render a progress bar', async () => {
      fixture.componentRef.setInput('score', 60);
      fixture.componentRef.setInput('label', 'Score');
      await fixture.whenStable();

      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeTruthy();
    });
  });
});
