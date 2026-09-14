import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PermissionService } from '../../services/permission.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent implements OnInit {
  customers: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { fullName: '', phone: '', email: '', idNumber: '', nationality: '', address: '', belongings: '' };
  showConfirmDialog = false;
  deleteCustomerId: number | null = null;
  private searchTimeout: any;
  Math = Math;

  customerColumns: SharedTableColumn[] = [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email', sortable: true, formatter: (c) => c.email || '-' },
    { key: 'idNumber', label: 'ID Number', sortable: true, formatter: (c) => c.idNumber || '-' },
    { key: 'nationality', label: 'Nationality', sortable: true, formatter: (c) => c.nationality || '-' },
  ];

  customerActions: SharedTableAction[] = [
    { action: 'view', label: 'View', icon: 'bi-eye', class: 'btn-outline-info', visible: () => this.canView() },
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: () => this.canEdit() },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: () => this.canDelete() },
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.api.getCustomers(this.searchTerm).subscribe({
      next: (data: any) => {
        this.customers = data;
        this.currentPage = 1;
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onCustomerTableAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.viewCustomer(event.row);
    if (event.action === 'edit') this.editCustomer(event.row);
    if (event.action === 'delete') this.deleteCustomer(event.row.id);
  }

  viewCustomer(customer: any): void {
    // Navigate to customer details
    // This would need router injection
    console.log('View customer:', customer);
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadCustomers(), 300);
  }

  openModal(): void {
    this.editing = false;
    this.form = { fullName: '', phone: '', email: '', idNumber: '', nationality: '', address: '', belongings: '' };
    this.showModal = true;
  }

  editCustomer(c: any): void {
    this.editing = true;
    this.editingId = c.id;
    this.form = { ...c };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCustomer(): void {
    const obs = this.editing
      ? this.api.updateCustomer(this.editingId, this.form)
      : this.api.createCustomer(this.form);

    obs.subscribe({
      next: () => { this.closeModal(); this.loadCustomers(); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving customer'),
    });
  }

  deleteCustomer(id: number): void {
    this.deleteCustomerId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteCustomerId) {
      this.api.deleteCustomer(this.deleteCustomerId).subscribe({ next: () => { this.loadCustomers(); this.showConfirmDialog = false; this.deleteCustomerId = null; } });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteCustomerId = null;
  }

  canView(): boolean {
    return this.permission.canView('customers');
  }

  canCreate(): boolean {
    return this.permission.canCreate('customers');
  }

  canEdit(): boolean {
    return this.permission.canEdit('customers');
  }

  canDelete(): boolean {
    return this.permission.canDelete('customers');
  }
}
