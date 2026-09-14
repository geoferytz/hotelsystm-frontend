import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  form = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  loading = false;
  success = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  changePassword(): void {
    if (this.form.newPassword !== this.form.confirmPassword) {
      this.error = 'New password and confirm password do not match.';
      return;
    }

    if (this.form.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }

    this.loading = true;
    this.success = false;
    this.error = '';

    // Simulate password change (in real app, call API)
    setTimeout(() => {
      this.loading = false;
      this.success = true;
      this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
      setTimeout(() => this.success = false, 3000);
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(['/settings/user-profile']);
  }
}
