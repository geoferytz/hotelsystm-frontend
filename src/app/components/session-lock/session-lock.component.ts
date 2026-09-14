import { Component, OnInit, OnDestroy } from '@angular/core';
import { SessionLockService } from '../../services/session-lock.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-session-lock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-lock.component.html',
  styleUrls: ['./session-lock.component.css']
})
export class SessionLockComponent implements OnInit, OnDestroy {
  isLocked = false;
  showWarning = false;
  lockCountdown = 0;
  password = '';
  showPassword = false;
  errorMessage = '';
  
  private isLockedSubscription: Subscription | null = null;
  private showWarningSubscription: Subscription | null = null;
  private lockCountdownSubscription: Subscription | null = null;
  
  constructor(private sessionLockService: SessionLockService) {}
  
  ngOnInit(): void {
    // Subscribe to lock state changes
    this.isLockedSubscription = this.sessionLockService.isLocked$.subscribe(locked => {
      this.isLocked = locked;
      if (locked) {
        this.password = '';
        this.errorMessage = '';
      }
    });
    
    // Subscribe to warning state changes
    this.showWarningSubscription = this.sessionLockService.showWarning$.subscribe(warning => {
      this.showWarning = warning;
    });
    
    // Subscribe to countdown changes
    this.lockCountdownSubscription = this.sessionLockService.lockCountdown$.subscribe(countdown => {
      this.lockCountdown = countdown;
    });
  }
  
  ngOnDestroy(): void {
    if (this.isLockedSubscription) {
      this.isLockedSubscription.unsubscribe();
    }
    if (this.showWarningSubscription) {
      this.showWarningSubscription.unsubscribe();
    }
    if (this.lockCountdownSubscription) {
      this.lockCountdownSubscription.unsubscribe();
    }
  }
  
  unlockSession(): void {
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }
    
    // In a real application, you would verify the password against the user's stored password
    // For now, we'll accept any non-empty password
    const unlocked = this.sessionLockService.unlockSession(this.password);
    
    if (!unlocked) {
      this.errorMessage = 'Invalid password. Please try again.';
    }
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  dismissWarning(): void {
    this.sessionLockService.dismissWarning();
  }
  
  logout(): void {
    this.sessionLockService.logout();
  }
}
