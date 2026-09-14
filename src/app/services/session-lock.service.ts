import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionLockService {
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
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
  
  constructor(private router: Router) {
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
  
  unlockSession(password: string): boolean {
    // In a real application, you would verify the password here
    // For now, we'll just unlock the session
    this.isLockedSubject.next(false);
    this.showWarningSubject.next(false);
    this.lockCountdownSubject.next(0);
    this.resetInactivityTimer();
    return true;
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
    
    // Navigate to login
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  
  get isLocked(): boolean {
    return this.isLockedSubject.value;
  }
  
  get showWarning(): boolean {
    return this.showWarningSubject.value;
  }
}
