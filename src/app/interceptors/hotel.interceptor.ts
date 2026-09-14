import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HotelService } from '../services/hotel.service';

export const hotelInterceptor: HttpInterceptorFn = (req, next) => {
  const hotelService = inject(HotelService);
  const hotelId = hotelService.selectedHotelId;

  if (hotelId) {
    const cloned = req.clone({
      setHeaders: { 'X-Hotel-Id': hotelId.toString() },
    });
    return next(cloned);
  }

  return next(req);
};
