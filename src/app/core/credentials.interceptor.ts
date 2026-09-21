import { HttpInterceptorFn } from '@angular/common/http';

// Sends the httpOnly session cookie with every same-origin API call, so auth
// state never has to be carried as a token in JS-visible storage or a URL.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
