import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { isGoogleApiRequest } from './google-api.utils';

const MAX_RETRIES = 5;

/** Exponential backoff: 2^attempt seconds + random jitter (0-1000ms). */
export function getBackoffDelay(attempt: number): number {
  const base = 2 ** attempt * 1000;
  const jitter = Math.random() * 1000;
  return base + jitter;
}

export const retryInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (!isGoogleApiRequest(req.url)) {
    return next(req);
  }

  const executeWithRetry = (attempt: number): Observable<HttpEvent<unknown>> =>
    next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 429 && attempt < MAX_RETRIES) {
          return timer(getBackoffDelay(attempt)).pipe(
            switchMap(() => executeWithRetry(attempt + 1)),
          );
        }
        return throwError(() => error);
      }),
    );

  return executeWithRetry(0);
};
