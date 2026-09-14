import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { PermissionService } from '../../services/permission.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  showModal = false;
  showPasswordModal = false;
  showConfirmDialog = false;
  deleteUserId: number | null = null;
  editing = false;
  editingId = 0;
  filterRole = '';
  filterActive = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { fullName: '', username: '', email: '', password: '', role: 'receptionist', roleId: null };
  passwordUser: any = null;
  newPassword = '';
  confirmPassword = '';
  Math = Math;

  userColumns: SharedTableColumn[] = [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', type: 'status', sortable: true, statusClass: (role) => {
      const map: Record<string, string> = { 'admin': 'danger', 'receptionist': 'primary', 'staff': 'info' };
      return map[role] || 'secondary';
    }, formatter: (u) => u.role },
    { key: 'isActive', label: 'Status', type: 'status', sortable: true, statusClass: (isActive) => isActive ? 'success' : 'secondary', formatter: (u) => u.isActive ? 'Active' : 'Inactive' },
    { key: 'createdAt', label: 'Created', sortable: true, formatter: (u) => new Date(u.createdAt).toLocaleDateString() },
  ];

  userActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: () => this.canEdit() },
    { action: 'change-password', label: 'Change Password', icon: 'bi-key', class: 'btn-outline-warning', visible: () => this.canEdit() },
    { action: 'toggle-active', label: 'Toggle Active', icon: 'bi-person-dash', class: 'btn-outline-secondary', visible: (row) => this.canEdit() },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: () => this.canDelete() },
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.api.getUserList({ role: this.filterRole, isActive: this.filterActive }).subscribe({
      next: (data: any) => {
        this.users = data;
        this.currentPage = 1;
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onUserTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editUser(event.row);
    if (event.action === 'change-password') this.openPasswordModal(event.row);
    if (event.action === 'toggle-active') this.toggleActive(event.row);
    if (event.action === 'delete') this.deleteUser(event.row.id);
  }

  loadRoles(): void {
    this.api.getRoles().subscribe({
      next: (data: any) => this.roles = data,
      error: (err: any) => this.toast.error('Load Failed', err.error?.message || 'Error loading roles'),
    });
  }

  openModal(): void {
    this.editing = false;
    this.form = { fullName: '', username: '', email: '', password: '', role: 'receptionist', roleId: null };
    this.showModal = true;
  }

  editUser(u: any): void {
    this.editing = true;
    this.editingId = u.id;
    this.form = { fullName: u.fullName, email: u.email, role: u.role, roleId: u.roleId };
    this.showModal = true;
  }

  syncRoleName(): void {
    if (this.form.roleId) {
      const role = this.roles.find((r: any) => r.id === this.form.roleId);
      if (role) {
        this.form.role = role.name;
      }
    }
  }

  saveUser(): void {
    const obs = this.editing
      ? this.api.updateUser(this.editingId, this.form)
      : this.api.createUser(this.form);
    obs.subscribe({
      next: () => { this.closeModals(); this.loadUsers(); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving user'),
    });
  }

  openPasswordModal(u: any): void {
    this.passwordUser = u;
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPasswordModal = true;
  }

  changePassword(): void {
    if (this.newPassword.length < 6) {
      this.toast.warning('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toast.warning('Mismatch', 'Passwords do not match.');
      return;
    }
    this.api.changeUserPassword(this.passwordUser.id, this.newPassword).subscribe({
      next: () => { this.toast.success('Password Changed', 'Password has been updated successfully.'); this.closeModals(); },
      error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error changing password'),
    });
  }

  toggleActive(u: any): void {
    const action = u.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${u.fullName}?`)) {
      this.api.toggleUserActive(u.id).subscribe({ next: () => this.loadUsers() });
    }
  }

  deleteUser(id: number): void {
    this.deleteUserId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteUserId !== null) {
      this.api.deleteUser(this.deleteUserId).subscribe({ next: () => this.loadUsers() });
    }
    this.showConfirmDialog = false;
    this.deleteUserId = null;
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteUserId = null;
  }

  closeModals(): void {
    this.showModal = false;
    this.showPasswordModal = false;
  }

  canView(): boolean {
    return this.permission.canView('users');
  }

  canCreate(): boolean {
    return this.permission.canCreate('users');
  }

  canEdit(): boolean {
    return this.permission.canEdit('users');
  }

  canDelete(): boolean {
    return this.permission.canDelete('users');
  }
}
