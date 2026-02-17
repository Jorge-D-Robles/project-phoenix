import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TaskCardComponent } from './task-card.component';
import type { Task } from '../../data/models/task.model';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  localId: 'local-1',
  title: 'Buy groceries',
  status: 'needsAction',
  dueDateTime: '2026-02-20T00:00:00.000Z',
  notes: 'Milk, eggs, bread',
  meta: null,
  parent: null,
  position: '00000000000000000001',
  updatedDateTime: '2026-02-16T12:00:00.000Z',
  ...overrides,
});

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
  });

  describe('rendering', () => {
    it('should display the task title', async () => {
      fixture.componentRef.setInput('task', makeTask());
      await fixture.whenStable();

      const titleEl = fixture.debugElement.query(By.css('[data-testid="task-title"]'));
      expect(titleEl.nativeElement.textContent).toContain('Buy groceries');
    });

    it('should display the due date when present', async () => {
      fixture.componentRef.setInput('task', makeTask());
      await fixture.whenStable();

      const dueEl = fixture.debugElement.query(By.css('[data-testid="task-due"]'));
      expect(dueEl).toBeTruthy();
      expect(dueEl.nativeElement.textContent).toBeTruthy();
    });

    it('should not display due date when null', async () => {
      fixture.componentRef.setInput('task', makeTask({ dueDateTime: null }));
      await fixture.whenStable();

      const dueEl = fixture.debugElement.query(By.css('[data-testid="task-due"]'));
      expect(dueEl).toBeFalsy();
    });

    it('should display notes preview when present', async () => {
      fixture.componentRef.setInput('task', makeTask());
      await fixture.whenStable();

      const notesEl = fixture.debugElement.query(By.css('[data-testid="task-notes"]'));
      expect(notesEl).toBeTruthy();
      expect(notesEl.nativeElement.textContent).toContain('Milk, eggs, bread');
    });

    it('should not display notes when null', async () => {
      fixture.componentRef.setInput('task', makeTask({ notes: null }));
      await fixture.whenStable();

      const notesEl = fixture.debugElement.query(By.css('[data-testid="task-notes"]'));
      expect(notesEl).toBeFalsy();
    });

    it('should show strikethrough on title when completed', async () => {
      fixture.componentRef.setInput('task', makeTask({ status: 'completed' }));
      await fixture.whenStable();

      const titleEl = fixture.debugElement.query(By.css('[data-testid="task-title"]'));
      expect(titleEl.nativeElement.classList.contains('line-through')).toBeTrue();
    });

    it('should not show strikethrough on title when active', async () => {
      fixture.componentRef.setInput('task', makeTask({ status: 'needsAction' }));
      await fixture.whenStable();

      const titleEl = fixture.debugElement.query(By.css('[data-testid="task-title"]'));
      expect(titleEl.nativeElement.classList.contains('line-through')).toBeFalse();
    });

    it('should apply task-completing animation class when task is completed', async () => {
      fixture.componentRef.setInput('task', makeTask({ status: 'completed' }));
      await fixture.whenStable();

      const cardEl = fixture.debugElement.query(By.css('.task-completing'));
      expect(cardEl).toBeTruthy();
    });

    it('should not apply task-completing animation class when task is active', async () => {
      fixture.componentRef.setInput('task', makeTask({ status: 'needsAction' }));
      await fixture.whenStable();

      const cardEl = fixture.debugElement.query(By.css('.task-completing'));
      expect(cardEl).toBeFalsy();
    });

    it('should show subtask indicator when parent is set', async () => {
      fixture.componentRef.setInput('task', makeTask({ parent: 'parent-1' }));
      await fixture.whenStable();

      const subtaskEl = fixture.debugElement.query(By.css('[data-testid="subtask-indicator"]'));
      expect(subtaskEl).toBeTruthy();
    });

    it('should not show subtask indicator for top-level tasks', async () => {
      fixture.componentRef.setInput('task', makeTask({ parent: null }));
      await fixture.whenStable();

      const subtaskEl = fixture.debugElement.query(By.css('[data-testid="subtask-indicator"]'));
      expect(subtaskEl).toBeFalsy();
    });
  });

  describe('interactions', () => {
    it('should emit toggle event when checkbox is clicked', async () => {
      fixture.componentRef.setInput('task', makeTask());
      await fixture.whenStable();

      let emittedId: string | undefined;
      component.toggle.subscribe((id: string) => {
        emittedId = id;
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      checkbox.triggerEventHandler('change', {});
      expect(emittedId).toBe('task-1');
    });

    it('should emit edit event when card is clicked', async () => {
      fixture.componentRef.setInput('task', makeTask());
      await fixture.whenStable();

      let emittedId: string | undefined;
      component.edit.subscribe((id: string) => {
        emittedId = id;
      });

      const card = fixture.debugElement.query(By.css('[data-testid="task-card-body"]'));
      card.nativeElement.click();
      expect(emittedId).toBe('task-1');
    });

    it('should emit delete event when delete button is clicked', async () => {
      fixture.componentRef.setInput('task', makeTask());
      await fixture.whenStable();

      let emittedId: string | undefined;
      component.delete.subscribe((id: string) => {
        emittedId = id;
      });

      const deleteBtn = fixture.debugElement.query(By.css('[data-testid="task-delete"]'));
      deleteBtn.nativeElement.click();
      expect(emittedId).toBe('task-1');
    });

    it('should have checkbox checked when task is completed', async () => {
      fixture.componentRef.setInput('task', makeTask({ status: 'completed' }));
      await fixture.whenStable();

      const input = fixture.debugElement.query(By.css('mat-checkbox input[type="checkbox"]'));
      expect(input.nativeElement.checked).toBeTrue();
    });

    it('should have checkbox unchecked when task needs action', async () => {
      fixture.componentRef.setInput('task', makeTask({ status: 'needsAction' }));
      await fixture.whenStable();

      const input = fixture.debugElement.query(By.css('mat-checkbox input[type="checkbox"]'));
      expect(input.nativeElement.checked).toBeFalse();
    });
  });
});
