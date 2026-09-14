import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private userPermissions: string[] = [];

  constructor(private auth: AuthService, private api: ApiService) {
    this.loadFromStorage();
  }

  /** Load permissions from localStorage (populated on login). */
  private loadFromStorage(): void {
    const stored = localStorage.getItem('hms_permissions');
    if (stored) {
      this.userPermissions = JSON.parse(stored);
    }
  }

  /** Called after role permissions change — fetches fresh permissions from API. */
  refreshPermissions(): void {
    const user = this.auth.getStoredUser();
    if (!user) return;

    if (user.roleId) {
      this.api.getRole(user.roleId).subscribe({
        next: (role: any) => {
          if (role && role.Permissions) {
            this.userPermissions = role.Permissions.map((p: any) => `${p.module}.${p.action}`);
            localStorage.setItem('hms_permissions', JSON.stringify(this.userPermissions));
          }
        },
        error: () => {
          // Fallback: try role name matching
          this.refreshByRoleName(user.role);
        }
      });
    } else if (user.role) {
      this.refreshByRoleName(user.role);
    }
  }

  private refreshByRoleName(roleName: string): void {
    this.api.getRoles().subscribe({
      next: (roles: any) => {
        const match = roles.find((r: any) => r.name.toLowerCase() === roleName.toLowerCase());
        if (match && match.Permissions) {
          this.userPermissions = match.Permissions.map((p: any) => `${p.module}.${p.action}`);
          localStorage.setItem('hms_permissions', JSON.stringify(this.userPermissions));
        }
      }
    });
  }

  isAdmin(): boolean {
    const user = this.auth.getStoredUser();
    return !!user && user.role.toLowerCase() === 'admin';
  }

  hasPermission(permission: string): boolean {
    if (this.isAdmin()) return true;
    return this.userPermissions.includes(permission);
  }

  hasModulePermission(module: string, action: string): boolean {
    if (this.isAdmin()) return true;
    return this.userPermissions.includes(`${module}.${action}`);
  }

  canView(module: string): boolean {
    return this.hasModulePermission(module, 'view') || this.hasModulePermission(module, 'manage');
  }

  canCreate(module: string): boolean {
    return this.hasModulePermission(module, 'create') || this.hasModulePermission(module, 'manage');
  }

  canEdit(module: string): boolean {
    return this.hasModulePermission(module, 'edit') || this.hasModulePermission(module, 'manage');
  }

  canDelete(module: string): boolean {
    return this.hasModulePermission(module, 'delete') || this.hasModulePermission(module, 'manage');
  }

  canManage(module: string): boolean {
    return this.hasModulePermission(module, 'manage');
  }
}
