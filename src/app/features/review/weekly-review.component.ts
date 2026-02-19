import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReviewTasksStepComponent } from './review-tasks-step.component';
import { ReviewHabitsStepComponent } from './review-habits-step.component';
import { ReviewCalendarStepComponent } from './review-calendar-step.component';
import { ReviewPlanStepComponent } from './review-plan-step.component';
import { ReviewSummaryStepComponent } from './review-summary-step.component';

@Component({
  selector: 'app-weekly-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    ReviewTasksStepComponent,
    ReviewHabitsStepComponent,
    ReviewCalendarStepComponent,
    ReviewPlanStepComponent,
    ReviewSummaryStepComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <mat-icon class="text-primary">rate_review</mat-icon>
        <h1 class="text-2xl font-semibold">Weekly Review</h1>
      </div>

      <mat-stepper linear="false" data-testid="review-stepper" #stepper>
        <mat-step label="Tasks">
          <ng-template matStepContent>
            <app-review-tasks-step />
            <div class="flex justify-end mt-4">
              <button mat-flat-button matStepperNext>Next</button>
            </div>
          </ng-template>
        </mat-step>

        <mat-step label="Habits">
          <ng-template matStepContent>
            <app-review-habits-step />
            <div class="flex justify-between mt-4">
              <button mat-stroked-button matStepperPrevious>Back</button>
              <button mat-flat-button matStepperNext>Next</button>
            </div>
          </ng-template>
        </mat-step>

        <mat-step label="Calendar">
          <ng-template matStepContent>
            <app-review-calendar-step />
            <div class="flex justify-between mt-4">
              <button mat-stroked-button matStepperPrevious>Back</button>
              <button mat-flat-button matStepperNext>Next</button>
            </div>
          </ng-template>
        </mat-step>

        <mat-step label="Plan">
          <ng-template matStepContent>
            <app-review-plan-step />
            <div class="flex justify-between mt-4">
              <button mat-stroked-button matStepperPrevious>Back</button>
              <button mat-flat-button matStepperNext>Next</button>
            </div>
          </ng-template>
        </mat-step>

        <mat-step label="Summary">
          <ng-template matStepContent>
            <app-review-summary-step />
            <div class="flex justify-between mt-4">
              <button mat-stroked-button matStepperPrevious>Back</button>
              <button mat-flat-button (click)="stepper.reset()">Start Over</button>
            </div>
          </ng-template>
        </mat-step>
      </mat-stepper>
    </div>
  `,
})
export class WeeklyReviewComponent {}
