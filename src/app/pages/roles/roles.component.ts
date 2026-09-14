import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { PermissionService } from '../../services/permission.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  showRoleModal = false;
  editingRole = false;
  editingRoleId = 0;
  selectedModule = 'all';
  roleForm: any = { name: '', description: '', isActive: true, permissionIds: [] };
  showConfirmDialog = false;
  deleteRoleId: number | null = null;
  users: any[] = [];
  usersByRole: any = {};
  allPermissions: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  roleColumns: SharedTableColumn[] = [];

  @ViewChild('roleNameTemplate', { static: true }) roleNameTemplate!: TemplateRef<any>;

  roleActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  modules = [
    { name: 'rooms', label: 'Rooms', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'bookings', label: 'Bookings', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'customers', label: 'Customers', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'billing', label: 'Billing', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'finance', label: 'Finance', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'workers', label: 'Workers', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'shifts', label: 'Shifts', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'reports', label: 'Reports', permissions: ['view', 'create', 'export', 'manage'] },
    { name: 'users', label: 'Users', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'roles', label: 'Roles', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'hotels', label: 'Hotels', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'services', label: 'Services', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'meals', label: 'Meals', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'restaurant', label: 'Restaurant', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
    { name: 'settings', label: 'Settings', permissions: ['view', 'edit', 'manage'] }
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.roleColumns = [
      { key: 'name', label: 'Role Name', sortable: true, type: 'template', template: this.roleNameTemplate },
      { key: 'description', label: 'Description', sortable: true, formatter: (r) => r.description || '-' },
      { key: 'isActive', label: 'Status', type: 'status', sortable: true, statusClass: (isActive) => isActive ? 'success' : 'secondary', formatter: (r) => r.isActive ? 'Active' : 'Inactive' },
    ];
    this.loadRoles();
    this.loadUsers();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.api.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data;
        this.currentPage = 1;
      },
      error: (err: any) => this.toast.error('Load Failed', err.error?.message || 'Error loading roles'),
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onRoleTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editRole(event.row);
    if (event.action === 'delete') this.deleteRole(event.row.id);
  }

  loadPermissions(): void {
    this.api.getPermissions().subscribe({
      next: (data: any) => this.allPermissions = data,
      error: (err: any) => this.toast.error('Load Failed', err.error?.message || 'Error loading permissions'),
    });
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (data: any) => {
        this.users = data;
        this.groupUsersByRole();
      },
      error: (err: any) => this.toast.error('Load Failed', err.error?.message || 'Error loading users'),
    });
  }

  groupUsersByRole(): void {
    this.usersByRole = {};
    this.users.forEach((user: any) => {
      const role = user.role || 'unassigned';
      if (!this.usersByRole[role]) {
        this.usersByRole[role] = [];
      }
      this.usersByRole[role].push(user);
    });
  }

  getUserCountForRole(roleName: string): number {
    return this.usersByRole[roleName]?.length || 0;
  }

  getExistingRoleNames(): string[] {
    return Object.keys(this.usersByRole).filter(role => role && role !== 'unassigned');
  }

  openRoleModal(): void {
    this.editingRole = false;
    this.editingRoleId = 0;
    this.roleForm = { name: '', description: '', isActive: true, permissionIds: [] };
    this.selectedModule = 'all';
    // Ensure permissions are loaded before opening modal
    if (this.allPermissions.length === 0) {
      this.loadPermissions();
    }
    this.showRoleModal = true;
  }

  editRole(r: any): void {
    // Ensure permissions are loaded before editing
    if (this.allPermissions.length === 0) {
      this.loadPermissions();
    }
    this.editingRole = true;
    this.editingRoleId = r.id;
    this.roleForm = {
      name: r.name,
      description: r.description,
      isActive: r.isActive,
      permissionIds: r.Permissions?.map((p: any) => {
        const permString = `${p.module}.${p.action}`;
        console.log('Loading permission:', permString);
        return permString;
      }) || [],
    };
    this.selectedModule = 'all';
    this.showRoleModal = true;
    
    console.log('Loaded roleForm.permissionIds:', this.roleForm.permissionIds);
    console.log('Available permissions in allPermissions:', this.allPermissions.length);
    
    // Auto-grant all permissions for admin role
    if (r.name.toLowerCase() === 'admin') {
      this.grantAllPermissions();
    }
  }

  getPermissionId(permissionString: string): number | null {
    const [module, action] = permissionString.split('.');
    const permission = this.allPermissions.find(p => p.module === module && p.action === action);
    return permission ? permission.id : null;
  }

  selectModule(module: string): void {
    this.selectedModule = module;
  }

  getModulePermissions(module: string): any[] {
    const moduleData = this.modules.find(m => m.name === module);
    if (!moduleData) return [];
    return moduleData.permissions.map(perm => ({
      id: `${module}.${perm}`,
      module: module,
      action: perm,
      description: `${perm.charAt(0).toUpperCase() + perm.slice(1)} ${moduleData.label}`
    }));
  }

  togglePermission(permissionId: string): void {
    const idx = this.roleForm.permissionIds.indexOf(permissionId);
    if (idx >= 0) this.roleForm.permissionIds.splice(idx, 1);
    else this.roleForm.permissionIds.push(permissionId);
  }

  toggleAllPermissions(module: string): void {
    const modulePerms = this.getModulePermissions(module);
    const allSelected = modulePerms.every(p => this.roleForm.permissionIds.includes(p.id));
    
    if (allSelected) {
      modulePerms.forEach(p => {
        const idx = this.roleForm.permissionIds.indexOf(p.id);
        if (idx >= 0) this.roleForm.permissionIds.splice(idx, 1);
      });
    } else {
      modulePerms.forEach(p => {
        if (!this.roleForm.permissionIds.includes(p.id)) {
          this.roleForm.permissionIds.push(p.id);
        }
      });
    }
  }

  isAllSelected(module: string): boolean {
    const modulePerms = this.getModulePermissions(module);
    if (modulePerms.length === 0) return false;
    return modulePerms.every(p => this.roleForm.permissionIds.includes(p.id));
  }

  isPartiallySelected(module: string): boolean {
    const modulePerms = this.getModulePermissions(module);
    if (modulePerms.length === 0) return false;
    const selectedCount = modulePerms.filter(p => this.roleForm.permissionIds.includes(p.id)).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  }

  getDisplayedModules(): any[] {
    if (this.selectedModule === 'all') return this.modules;
    return this.modules.filter(m => m.name === this.selectedModule);
  }

  grantAllPermissions(): void {
    this.roleForm.permissionIds = [];
    this.modules.forEach(module => {
      module.permissions.forEach(perm => {
        this.roleForm.permissionIds.push(`${module.name}.${perm}`);
      });
    });
  }

  onRoleNameChange(): void {
    if (this.roleForm.name.toLowerCase() === 'admin') {
      this.grantAllPermissions();
    }
  }

  saveRole(): void {
    // Ensure permissions are loaded before saving
    if (this.allPermissions.length === 0) {
      this.toast.error('Permissions Not Loaded', 'Please wait for permissions to load or refresh the page.');
      this.loadPermissions();
      return;
    }

    console.log('Saving role with permissionIds (strings):', this.roleForm.permissionIds);

    // Map permission strings to permission IDs for the backend
    const permissionIds = this.roleForm.permissionIds
      .map((permString: string) => {
        const id = this.getPermissionId(permString);
        console.log(`Mapping ${permString} -> ${id}`);
        return id;
      })
      .filter((id: number | null) => id !== null);

    console.log('Mapped permissionIds (numbers):', permissionIds);

    if (permissionIds.length === 0 && this.roleForm.permissionIds.length > 0) {
      this.toast.error('Mapping Error', 'Failed to map permissions. Please refresh the page and try again.');
      return;
    }

    const payload = {
      name: this.roleForm.name,
      description: this.roleForm.description,
      isActive: this.roleForm.isActive,
      permissionIds: permissionIds
    };
    
    console.log('Sending payload to backend:', payload);
    
    const obs = this.editingRole
      ? this.api.updateRole(this.editingRoleId, payload)
      : this.api.createRole(payload);
    obs.subscribe({
      next: () => { this.closeModals(); this.loadRoles(); this.loadUsers(); this.permission.refreshPermissions(); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving role'),
    });
  }

  deleteRole(id: number): void {
    this.deleteRoleId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteRoleId) {
      this.api.deleteRole(this.deleteRoleId).subscribe({ next: () => { this.closeModals(); this.loadRoles(); this.loadUsers(); this.showConfirmDialog = false; this.deleteRoleId = null; } });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteRoleId = null;
  }

  closeModals(): void {
    this.showRoleModal = false;
  }
}
