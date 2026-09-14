import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading = false;
  saving = false;
  success = false;
  error = '';

  form = {
    fullName: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getStoredUser();
    if (this.user) {
      this.form.fullName = this.user.fullName || '';
      this.form.email = this.user.email || '';
      this.form.phone = this.user.phone || '';
      this.form.address = this.user.address || '';
    }
  }

  saveProfile(): void {
    this.saving = true;
    this.success = false;
    this.error = '';

    // Update local storage user data
    const updatedUser = { ...this.user, ...this.form };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.user = updatedUser;

    this.saving = false;
    this.success = true;
    setTimeout(() => this.success = false, 3000);
  }
}
