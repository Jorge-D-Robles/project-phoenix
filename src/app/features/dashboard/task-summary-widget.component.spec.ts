import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TaskSummaryWidgetComponent } from './task-summary-widget.component';
import type { Task } from '../../data/models/task.model';

const MOCK_TASKS: Task[] = [
  {
    id: 't1', localId: 'l1', title: 'Buy groceries', status: 'needsAction',
    dueDateTime: '2026-02-16T10:00:00Z', notes: null, meta: null,
    parent: null, position: '001', updatedDateTime: '2026-02-16T00:00:00Z',
  },
  {
    id: 't2', localId: 'l2', title: 'Walk dog', status: 'needsAction',
    dueDateTime: '2026-02-16T11:00:00Z', notes: null, meta: null,
    parent: null, position: '002', updatedDateTime: '2026-02-16T00:00:00Z',
  },
];

describe('TaskSummaryWidgetComponent', () => {
  async function setup(tasks: Task[] = MOCK_TASKS) {
    await TestBed.configureTestingModule({
      imports: [TaskSummaryWidgetComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskSummaryWidgetComponent);
    fixture.componentRef.setInput('tasks', tasks);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should render the card', async () => {
      const fixture = await setup();
      const card = fixture.debugElement.query(By.css('[data-testid="task-summary-card"]'));
      expect(card).toBeTruthy();
    });

    it('should render task items for each task', async () => {
      const fixture = await setup();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="task-item"]'));
      expect(items.length).toBe(2);
    });

    it('should display task titles', async () => {
      const fixture = await setup();
      const titles = fixture.debugElement.queryAll(By.css('[data-testid="task-title"]'));
      expect(titles[0].nativeElement.textContent).toContain('Buy groceries');
      expect(titles[1].nativeElement.textContent).toContain('Walk dog');
    });

    it('should show empty state when no tasks', async () => {
      const fixture = await setup([]);
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeTruthy();
      expect(empty.nativeElement.textContent).toContain('No tasks due today');
    });

    it('should not show empty state when tasks exist', async () => {
      const fixture = await setup();
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeFalsy();
    });
  });

  describe('interactions', () => {
    it('should emit toggle event with task id when checkbox changes', async () => {
      const fixture = await setup();
      const component = fixture.componentInstance;
      let emittedId: string | undefined;
      component.toggle.subscribe((id: string) => emittedId = id);

      const checkbox = fixture.debugElement.query(By.css('[data-testid="task-checkbox"]'));
      checkbox.triggerEventHandler('change', {});

      expect(emittedId).toBe('t1');
    });
  });
});
