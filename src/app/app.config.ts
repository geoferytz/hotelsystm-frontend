import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { hotelInterceptor } from './interceptors/hotel.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, hotelInterceptor])),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !/localhost/.test(window.location.hostname),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
