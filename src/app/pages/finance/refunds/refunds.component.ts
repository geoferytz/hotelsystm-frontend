import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './refunds.component.html',
  styleUrls: ['./refunds.component.css'],
})
export class RefundsComponent implements OnInit {
  refunds: any[] = [];
  billings: any[] = [];
  showModal = false;
  showDetailsModal = false;
  editing = false;
  editingId = 0;
  filterStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { billingId: '', amount: 0, reason: '', refundMethod: '', notes: '' };
  selectedRefund: any = null;
  Math = Math;

  refundColumns: SharedTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, formatter: (r) => `#${r.id}` },
    { key: 'billingId', label: 'Invoice', sortable: true, formatter: (r) => `#${r.billingId}` },
    { key: 'Billing.Customer.fullName', label: 'Guest', sortable: true, formatter: (r) => r.Billing?.Customer?.fullName || '-' },
    { key: 'amount', label: 'Amount', type: 'currency', align: 'end', sortable: true, formatter: (r) => `${Number(r.amount || 0).toLocaleString()}` },
    { key: 'reason', label: 'Reason', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (status) => this.getStatusBadgeClass(status) },
    { key: 'refundMethod', label: 'Method', sortable: true, formatter: (r) => r.refundMethod ? String(r.refundMethod).replace(/\b\w/g, (c: string) => c.toUpperCase()) : '-' },
    { key: 'createdAt', label: 'Date', sortable: true, formatter: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  refundActions: SharedTableAction[] = [
    { action: 'view', label: 'View', icon: 'bi-eye', class: 'btn-outline-info' },
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: (row) => row.status === 'pending' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: (row) => row.status === 'pending' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadRefunds();
    this.loadBillings();
  }

  loadRefunds(): void {
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    this.api.getRefunds(params).subscribe({
      next: (data: any) => {
        this.refunds = data;
        this.currentPage = 1;
      },
      error: (err: any) => console.error('Error loading refunds:', err),
    });
  }

  loadBillings(): void {
    this.api.getBillings().subscribe({
      next: (data: any) => {
        this.billings = data.filter((b: any) => b.paymentStatus !== 'refunded');
      },
      error: (err: any) => console.error('Error loading billings:', err),
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onRefundTableAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.viewDetails(event.row);
    if (event.action === 'edit') this.editRefund(event.row);
    if (event.action === 'delete') this.deleteRefund(event.row.id);
  }

  openModal(): void {
    this.editing = false;
    this.form = { billingId: '', amount: 0, reason: '', refundMethod: '', notes: '' };
    this.showModal = true;
  }

  onBillingSelect(): void {
    const selected = this.billings.find((b: any) => b.id == this.form.billingId);
    if (selected) {
      this.form.amount = selected.totalAmount;
    }
  }

  editRefund(r: any): void {
    this.editing = true;
    this.editingId = r.id;
    this.form = { ...r };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveRefund(): void {
    const obs = this.editing
      ? this.api.updateRefund(this.editingId, this.form)
      : this.api.createRefund(this.form);
    obs.subscribe({
      next: () => {
        this.closeModal();
        this.loadRefunds();
        this.toast.success('Refund Saved', this.editing ? 'Refund updated.' : 'Refund created.');
      },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving refund'),
    });
  }

  deleteRefund(id: number): void {
    if (confirm('Delete this refund record?')) {
      this.api.deleteRefund(id).subscribe({
        next: () => {
          this.loadRefunds();
          this.toast.success('Deleted', 'Refund deleted successfully.');
        },
        error: (err: any) => this.toast.error('Delete Failed', err.error?.message || 'Error deleting refund'),
      });
    }
  }

  viewDetails(r: any): void {
    this.api.getRefund(r.id).subscribe({
      next: (data: any) => {
        this.selectedRefund = data;
        this.showDetailsModal = true;
      },
      error: (err: any) => this.toast.error('Error', 'Failed to load refund details'),
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRefund = null;
  }

  processRefund(): void {
    this.api.updateRefund(this.selectedRefund.id, {
      status: 'processed',
    }).subscribe({
      next: () => {
        this.closeDetailsModal();
        this.loadRefunds();
        this.toast.success('Processed', 'Refund marked as processed.');
      },
      error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error processing refund'),
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'rejected':
        return 'danger';
      case 'processed':
        return 'success';
      default:
        return 'secondary';
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
