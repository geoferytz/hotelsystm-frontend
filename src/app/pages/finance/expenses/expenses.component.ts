import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css'],
})
export class ExpensesComponent implements OnInit {
  expenses: any[] = [];
  showModal = false;
  showDetailsModal = false;
  editing = false;
  editingId = 0;
  filterCategory = '';
  filterStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { category: '', amount: 0, description: '', expenseDate: '', paymentMethod: '', vendor: '', receiptNumber: '', notes: '' };
  selectedExpense: any = null;
  Math = Math;

  expenseColumns: SharedTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, formatter: (e) => `#${e.id}` },
    { key: 'category', label: 'Category', sortable: true, formatter: (e) => e.category ? String(e.category).replace(/\b\w/g, (c: string) => c.toUpperCase()) : '-' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency', align: 'end', sortable: true, formatter: (e) => `${Number(e.amount || 0).toLocaleString()}` },
    { key: 'expenseDate', label: 'Date', sortable: true, formatter: (e) => new Date(e.expenseDate).toLocaleDateString() },
    { key: 'vendor', label: 'Vendor', sortable: true, formatter: (e) => e.vendor || '-' },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (status) => this.getStatusBadgeClass(status) },
    { key: 'paymentMethod', label: 'Method', sortable: true, formatter: (e) => e.paymentMethod ? String(e.paymentMethod).replace(/\b\w/g, (c: string) => c.toUpperCase()) : '-' },
  ];

  expenseActions: SharedTableAction[] = [
    { action: 'view', label: 'View', icon: 'bi-eye', class: 'btn-outline-info' },
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: (row) => row.status === 'pending' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: (row) => row.status === 'pending' },
  ];

  categories = ['supplies', 'maintenance', 'utilities', 'salaries', 'marketing', 'other'];
  paymentMethods = ['cash', 'card', 'transfer', 'mobile'];
  statuses = ['pending', 'approved', 'rejected'];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    const params: any = {};
    if (this.filterCategory) params.category = this.filterCategory;
    if (this.filterStatus) params.status = this.filterStatus;
    this.api.getExpenses(params).subscribe({
      next: (data: any) => {
        this.expenses = data;
        this.currentPage = 1;
      },
      error: (err: any) => console.error('Error loading expenses:', err),
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onExpenseTableAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.viewDetails(event.row);
    if (event.action === 'edit') this.editExpense(event.row);
    if (event.action === 'delete') this.deleteExpense(event.row.id);
  }

  openModal(): void {
    this.editing = false;
    this.form = { category: '', amount: 0, description: '', expenseDate: new Date().toISOString().split('T')[0], paymentMethod: '', vendor: '', receiptNumber: '', notes: '' };
    this.showModal = true;
  }

  editExpense(e: any): void {
    this.editing = true;
    this.editingId = e.id;
    this.form = { ...e, expenseDate: e.expenseDate ? e.expenseDate.split('T')[0] : '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveExpense(): void {
    const obs = this.editing
      ? this.api.updateExpense(this.editingId, this.form)
      : this.api.createExpense(this.form);
    obs.subscribe({
      next: () => {
        this.closeModal();
        this.loadExpenses();
        this.toast.success('Expense Saved', this.editing ? 'Expense updated.' : 'Expense created.');
      },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving expense'),
    });
  }

  deleteExpense(id: number): void {
    if (confirm('Delete this expense record?')) {
      this.api.deleteExpense(id).subscribe({
        next: () => {
          this.loadExpenses();
          this.toast.success('Deleted', 'Expense deleted successfully.');
        },
        error: (err: any) => this.toast.error('Delete Failed', err.error?.message || 'Error deleting expense'),
      });
    }
  }

  viewDetails(e: any): void {
    this.api.getExpense(e.id).subscribe({
      next: (data: any) => {
        this.selectedExpense = data;
        this.showDetailsModal = true;
      },
      error: (err: any) => this.toast.error('Error', 'Failed to load expense details'),
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedExpense = null;
  }

  approveExpense(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.api.updateExpense(this.selectedExpense.id, {
      status: 'approved',
      approvedBy: currentUser.id,
    }).subscribe({
      next: () => {
        this.closeDetailsModal();
        this.loadExpenses();
        this.toast.success('Approved', 'Expense approved successfully.');
      },
      error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error approving expense'),
    });
  }

  rejectExpense(): void {
    this.api.updateExpense(this.selectedExpense.id, { status: 'rejected' }).subscribe({
      next: () => {
        this.closeDetailsModal();
        this.loadExpenses();
        this.toast.success('Rejected', 'Expense rejected.');
      },
      error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error rejecting expense'),
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'supplies':
        return 'bi-box-seam';
      case 'maintenance':
        return 'bi-tools';
      case 'utilities':
        return 'bi-lightning-charge';
      case 'salaries':
        return 'bi-cash-coin';
      case 'marketing':
        return 'bi-megaphone';
      default:
        return 'bi-question-circle';
    }
  }

  getMethodIcon(method: string): string {
    switch (method) {
      case 'cash':
        return 'bi-cash';
      case 'card':
        return 'bi-credit-card';
      case 'transfer':
        return 'bi-bank';
      case 'mobile':
        return 'bi-phone';
      default:
        return 'bi-question-circle';
    }
  }
}
