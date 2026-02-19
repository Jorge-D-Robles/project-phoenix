import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/tasks.component').then((m) => m.TasksComponent),
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(
        (m) => m.CalendarComponent,
      ),
  },
  {
    path: 'habits',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/habits/habits.component').then(
        (m) => m.HabitsComponent,
      ),
  },
  {
    path: 'notes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notes/notes.component').then(
        (m) => m.NotesComponent,
      ),
  },
  {
    path: 'insights',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/insights/insights.component').then(
        (m) => m.InsightsComponent,
      ),
  },
  {
    path: 'journal',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/journal/journal.component').then(
        (m) => m.JournalComponent,
      ),
  },
  {
    path: 'review',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/review/weekly-review.component').then(
        (m) => m.WeeklyReviewComponent,
      ),
  },
  {
    path: 'planner',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/planner/planner.component').then(
        (m) => m.PlannerComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
