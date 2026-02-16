import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TaskDetailDialogComponent, TaskDialogData } from './task-detail-dialog.component';
import { Task } from '../../data/models/task.model';

const existingTask: Task = {
  id: 't1', localId: 'l1', title: 'Existing task', status: 'needsAction',
  dueDateTime: '2026-02-20T00:00:00.000Z', notes: 'Some notes',
  meta: null, parent: null, position: '001', updatedDateTime: '2026-02-16T00:00:00.000Z',
};

async function setup(data: TaskDialogData) {
  const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

  await TestBed.configureTestingModule({
    imports: [TaskDetailDialogComponent],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: dialogRef },
      provideNoopAnimations(),
      provideNativeDateAdapter(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TaskDetailDialogComponent);
  await fixture.whenStable();
  return { fixture, dialogRef };
}

describe('TaskDetailDialogComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('create mode', () => {
    it('should show "New Task" title', async () => {
      const { fixture } = await setup({ mode: 'create' });
      const title = fixture.debugElement.query(By.css('[mat-dialog-title]'));
      expect(title.nativeElement.textContent).toContain('New Task');
    });

    it('should start with empty fields', async () => {
      const { fixture } = await setup({ mode: 'create' });
      const titleInput = fixture.debugElement.query(By.css('[data-testid="task-title-input"]'));
      expect(titleInput.nativeElement.value).toBe('');
    });

    it('should disable save button when title is empty', async () => {
      const { fixture } = await setup({ mode: 'create' });
      const saveBtn = fixture.debugElement.query(By.css('[data-testid="dialog-save"]'));
      expect(saveBtn.nativeElement.disabled).toBeTrue();
    });

    it('should show "Create" on save button', async () => {
      const { fixture } = await setup({ mode: 'create' });
      const saveBtn = fixture.debugElement.query(By.css('[data-testid="dialog-save"]'));
      expect(saveBtn.nativeElement.textContent).toContain('Create');
    });

    it('should close dialog with task data on save', async () => {
      const { fixture, dialogRef } = await setup({ mode: 'create' });

      const component = fixture.componentInstance as TaskDetailDialogComponent & { title: string; save: () => void };
      component['title'] = 'New task title';
      component['save']();

      expect(dialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({ title: 'New task title' }),
      );
    });
  });

  describe('edit mode', () => {
    it('should show "Edit Task" title', async () => {
      const { fixture } = await setup({ mode: 'edit', task: existingTask });
      const title = fixture.debugElement.query(By.css('[mat-dialog-title]'));
      expect(title.nativeElement.textContent).toContain('Edit Task');
    });

    it('should populate fields from existing task', async () => {
      const { fixture } = await setup({ mode: 'edit', task: existingTask });
      const titleInput = fixture.debugElement.query(By.css('[data-testid="task-title-input"]'));
      expect(titleInput.nativeElement.value).toBe('Existing task');
    });

    it('should show "Save" on save button', async () => {
      const { fixture } = await setup({ mode: 'edit', task: existingTask });
      const saveBtn = fixture.debugElement.query(By.css('[data-testid="dialog-save"]'));
      expect(saveBtn.nativeElement.textContent).toContain('Save');
    });

    it('should close dialog with updated data on save', async () => {
      const { fixture, dialogRef } = await setup({ mode: 'edit', task: existingTask });

      const component = fixture.componentInstance as TaskDetailDialogComponent & { title: string; save: () => void };
      component['title'] = 'Updated title';
      component['save']();

      expect(dialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({ title: 'Updated title' }),
      );
    });
  });

  describe('cancel', () => {
    it('should render cancel button', async () => {
      const { fixture } = await setup({ mode: 'create' });
      const cancelBtn = fixture.debugElement.query(By.css('[data-testid="dialog-cancel"]'));
      expect(cancelBtn).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('should not close dialog when title is whitespace only', async () => {
      const { fixture, dialogRef } = await setup({ mode: 'create' });

      const component = fixture.componentInstance as TaskDetailDialogComponent & { title: string; save: () => void };
      component['title'] = '   ';
      component['save']();

      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
