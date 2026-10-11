import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { LanguageService, Lang } from '../../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private permission: PermissionService,
    public langService: LanguageService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  t(key: string): string {
    return this.langService.t(key);
  }

  setLang(lang: Lang): void {
    this.langService.setLang(lang);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.error = this.t('errMissing');
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.permission.refreshPermissions();
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.error = err.error?.message || this.t('errFailed');
        this.loading = false;
      },
    });
  }
}
