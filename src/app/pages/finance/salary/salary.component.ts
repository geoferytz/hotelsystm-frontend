import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css'],
})
export class SalaryComponent implements OnInit {
  salaries: any[] = [];
  workers: any[] = [];
  showModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editing = false;
  editingId = 0;
  filterStatus = '';
  filterPayPeriod = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { workerId: '', baseSalary: 0, bonus: 0, deductions: 0, overtime: 0, overtimeHours: 0, payPeriod: 'monthly', payDate: '', paymentMethod: '', notes: '' };
  selectedSalary: any = null;
  deletingSalary: any = null;
  Math = Math;

  salaryColumns: SharedTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, formatter: (s) => `#${s.id}` },
    { key: 'Employee.fullName', label: 'Employee', sortable: true, formatter: (s) => s.Employee?.fullName || this.getWorkerName(s.workerId) },
    { key: 'baseSalary', label: 'Base Salary', type: 'currency', align: 'end', sortable: true, formatter: (s) => `${Number(s.baseSalary || 0).toLocaleString()}` },
    { key: 'bonus', label: 'Bonus', type: 'currency', align: 'end', sortable: true, formatter: (s) => `${Number(s.bonus || 0).toLocaleString()}` },
    { key: 'overtime', label: 'Overtime', type: 'currency', align: 'end', sortable: true, formatter: (s) => `${Number(s.overtime || 0).toLocaleString()}` },
    { key: 'deductions', label: 'Deductions', type: 'currency', align: 'end', sortable: true, formatter: (s) => `${Number(s.deductions || 0).toLocaleString()}` },
    { key: 'grossSalary', label: 'Gross', type: 'currency', align: 'end', sortable: true, formatter: (s) => `${Number(s.grossSalary || 0).toLocaleString()}` },
    { key: 'netSalary', label: 'Net', type: 'currency', align: 'end', sortable: true, formatter: (s) => `${Number(s.netSalary || 0).toLocaleString()}` },
    { key: 'payDate', label: 'Pay Date', sortable: true, formatter: (s) => new Date(s.payDate).toLocaleDateString() },
    { key: 'payPeriod', label: 'Period', sortable: true, formatter: (s) => s.payPeriod || '-' },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (status) => this.getStatusBadgeClass(status) },
  ];

  salaryActions: SharedTableAction[] = [
    { action: 'view', label: 'View', icon: 'bi-eye', class: 'btn-outline-info' },
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: (row) => row.status === 'pending' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: (row) => row.status === 'pending' },
  ];

  payPeriods = ['weekly', 'bi-weekly', 'monthly'];
  paymentMethods = ['cash', 'bank_transfer', 'mobile', 'check'];
  statuses = ['pending', 'paid', 'cancelled'];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadSalaries();
    this.loadWorkers();
  }

  loadSalaries(): void {
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterPayPeriod) params.payPeriod = this.filterPayPeriod;
    this.api.getSalaries(params).subscribe({
      next: (data: any) => {
        this.salaries = data;
        this.currentPage = 1;
      },
      error: (err: any) => console.error('Error loading salaries:', err),
    });
  }

  loadWorkers(): void {
    this.api.getWorkers().subscribe({
      next: (data: any) => {
        this.workers = data;
      },
      error: (err: any) => console.error('Error loading workers:', err),
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onSalaryTableAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.viewDetails(event.row);
    if (event.action === 'edit') this.editSalary(event.row);
    if (event.action === 'delete') this.openDeleteModal(event.row);
  }

  openModal(): void {
    this.editing = false;
    this.form = { workerId: '', baseSalary: 0, bonus: 0, deductions: 0, overtime: 0, overtimeHours: 0, payPeriod: 'monthly', payDate: new Date().toISOString().split('T')[0], paymentMethod: '', notes: '' };
    this.showModal = true;
  }

  editSalary(s: any): void {
    this.editing = true;
    this.editingId = s.id;
    this.form = { ...s, payDate: s.payDate ? s.payDate.split('T')[0] : '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveSalary(): void {
    const obs = this.editing
      ? this.api.updateSalary(this.editingId, this.form)
      : this.api.createSalary(this.form);
    obs.subscribe({
      next: () => {
        this.closeModal();
        this.loadSalaries();
        this.toast.success('Salary Saved', this.editing ? 'Salary updated.' : 'Salary created.');
      },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving salary'),
    });
  }

  openDeleteModal(s: any): void {
    this.deletingSalary = s;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingSalary = null;
  }

  confirmDelete(): void {
    if (this.deletingSalary) {
      this.api.deleteSalary(this.deletingSalary.id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadSalaries();
          this.toast.success('Deleted', 'Salary record deleted successfully.');
        },
        error: (err: any) => {
          this.closeDeleteModal();
          this.toast.error('Delete Failed', err.error?.message || 'Error deleting salary');
        },
      });
    }
  }

  viewDetails(s: any): void {
    this.api.getSalary(s.id).subscribe({
      next: (data: any) => {
        this.selectedSalary = data;
        this.showDetailsModal = true;
      },
      error: (err: any) => this.toast.error('Error', 'Failed to load salary details'),
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSalary = null;
  }

  markAsPaid(): void {
    const paymentMethod = this.selectedSalary.paymentMethod || 'bank_transfer';
    this.api.markSalaryAsPaid(this.selectedSalary.id, paymentMethod).subscribe({
      next: () => {
        this.closeDetailsModal();
        this.loadSalaries();
        this.toast.success('Paid', 'Salary marked as paid successfully.');
      },
      error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error marking salary as paid'),
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getMethodIcon(method: string): string {
    switch (method) {
      case 'cash':
        return 'bi-cash';
      case 'bank_transfer':
        return 'bi-bank';
      case 'mobile':
        return 'bi-phone';
      case 'check':
        return 'bi-file-text';
      default:
        return 'bi-question-circle';
    }
  }

  getWorkerName(workerId: number): string {
    const worker = this.workers.find(w => w.id === workerId);
    return worker ? worker.fullName : 'Unknown';
  }
}
