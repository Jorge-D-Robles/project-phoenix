import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { isGoogleApiRequest } from './google-api.utils';

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  if (!isGoogleApiRequest(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const outgoing = token ? addAuthHeader(req, token) : req;

  return next(outgoing).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return from(authService.refreshToken()).pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            authService.logout();
            return throwError(() => error);
          }

          const newToken = authService.getAccessToken();
          const retryReq = newToken ? addAuthHeader(req, newToken) : req;
          return next(retryReq);
        }),
      );
    }),
  );
};
