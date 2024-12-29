import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Notify } from 'notiflix';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';
import { LoadingService } from '../_services/loading.service';
import { TokenStorageService } from '../_services/token-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private totalRequests = 0;
  constructor(private token: TokenStorageService,
    private authService: AuthService,
    private loadingService: LoadingService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.token.getToken();
    if (token != null) {
      let isContentTypeJson = req.headers.get('Content-Type') == 'application/json; charset=utf-8';
      if (isContentTypeJson) {
        authReq = req.clone({
          setHeaders: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        authReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
      }
    }
    this.totalRequests++;
    this.loadingService.setLoading(true);
    return next.handle(authReq).pipe(catchError(x => this.handleAuthError(token, x)),
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }

  handleAuthError(token: any, err: HttpErrorResponse): Observable<any> {
    if ((token != null && token != undefined && token != '' && err.status === 0) || (err.status === 0)) {
      Notify.failure("Mất kết nối với máy chủ, vui lòng liên hệ admin !", {
        timeout: 3000,
        failure: {
          childClassName: 'notiflix-notify-failure'
        }
      });
      return throwError(null);
    } else if (err.status === 401) {
      this.authService.logOut();
      return throwError(null);
    } else if (err.status === 400) {
      return throwError(err);
    } else {
      return throwError(new HttpErrorResponse({ error: 'Đã có lỗi xảy ra', status: 403 }));
    }
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];