import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts$ = new Subject<Toast>();
  dismiss$ = new Subject<number>();

  show(type: Toast['type'], title: string, message: string, duration = 4000): void {
    const id = ++this.counter;
    this.toasts$.next({ id, type, title, message, duration });
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(title: string, message = ''): void {
    this.show('success', title, message);
  }

  error(title: string, message = ''): void {
    this.show('error', title, message, 5000);
  }

  warning(title: string, message = ''): void {
    this.show('warning', title, message);
  }

  info(title: string, message = ''): void {
    this.show('info', title, message);
  }

  dismiss(id: number): void {
    this.dismiss$.next(id);
  }
}
