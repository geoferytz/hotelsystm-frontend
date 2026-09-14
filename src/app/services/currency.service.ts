import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly currency = 'TSH';

  format(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0';
    return `(${num.toLocaleString('en-US')} Tsh)`;
  }
}
