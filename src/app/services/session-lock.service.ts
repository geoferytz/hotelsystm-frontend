import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription, map, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionLockService {
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly WARNING_TIMEOUT = 30 * 1000; // 30 seconds before lock
  private inactivityTimer: Subscription | null = null;
  private warningTimer: Subscription | null = null;
  private lastActivityTime: number = Date.now();
  
  private isLockedSubject = new BehaviorSubject<boolean>(false);
  private showWarningSubject = new BehaviorSubject<boolean>(false);
  private lockCountdownSubject = new BehaviorSubject<number>(0);
  
  isLocked$: Observable<boolean> = this.isLockedSubject.asObservable();
  showWarning$: Observable<boolean> = this.showWarningSubject.asObservable();
  lockCountdown$: Observable<number> = this.lockCountdownSubject.asObservable();
  
  constructor(private router: Router, private authService: AuthService) {
    this.initializeActivityTracking();
  }
  
  private initializeActivityTracking(): void {
    // Track user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });
    
    this.startInactivityTimer();
  }
  
  private resetInactivityTimer(): void {
    if (this.isLockedSubject.value) {
      return; // Don't reset if already locked
    }
    
    this.lastActivityTime = Date.now();
    this.startInactivityTimer();
  }
  
  private startInactivityTimer(): void {
    // Clear existing timers
    if (this.inactivityTimer) {
      this.inactivityTimer.unsubscribe();
    }
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
    }
    
    // Start warning timer (30 seconds before lock)
    this.warningTimer = timer(this.INACTIVITY_TIMEOUT - this.WARNING_TIMEOUT).subscribe(() => {
      this.showWarningSubject.next(true);
      this.startCountdown();
    });
    
    // Start lock timer
    this.inactivityTimer = timer(this.INACTIVITY_TIMEOUT).subscribe(() => {
      this.lockSession();
    });
  }
  
  private startCountdown(): void {
    let countdown = 30;
    this.lockCountdownSubject.next(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown--;
      this.lockCountdownSubject.next(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }
  
  private lockSession(): void {
    this.isLockedSubject.next(true);
    this.showWarningSubject.next(false);
    this.lockCountdownSubject.next(0);
    
    // Clear timers
    if (this.inactivityTimer) {
      this.inactivityTimer.unsubscribe();
    }
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
    }
  }
  
  unlockSession(password: string): Observable<void> {
    const user = this.authService.getStoredUser();
    if (!user) {
      return throwError(() => ({ status: 0 }));
    }
    // Verify the password by re-authenticating - a fresh token is stored on success
    return this.authService.login(user.username, password).pipe(
      tap(() => {
        this.isLockedSubject.next(false);
        this.showWarningSubject.next(false);
        this.lockCountdownSubject.next(0);
        this.resetInactivityTimer();
      }),
      map(() => void 0)
    );
  }
  
  dismissWarning(): void {
    this.showWarningSubject.next(false);
    this.lockCountdownSubject.next(0);
    this.resetInactivityTimer();
  }
  
  logout(): void {
    this.isLockedSubject.next(false);
    this.showWarningSubject.next(false);
    this.lockCountdownSubject.next(0);
    
    // Clear timers
    if (this.inactivityTimer) {
      this.inactivityTimer.unsubscribe();
    }
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
    }
    
    // Clear session and navigate to login
    this.authService.logout();
  }
  
  get isLocked(): boolean {
    return this.isLockedSubject.value;
  }
  
  get showWarning(): boolean {
    return this.showWarningSubject.value;
  }
}
