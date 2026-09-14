import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-workers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.css'],
})
export class WorkersComponent implements OnInit {
  workers: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  searchTerm = '';
  filterStatus = '';
  filterDept = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  form: any = this.emptyForm();

  private searchTimeout: any;
  Math = Math;

  workerColumns: SharedTableColumn[] = [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true, formatter: (w) => w.phone || '-' },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'position', label: 'Position', sortable: true },
    { key: 'hireDate', label: 'Hire Date', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (value) => {
      const map: Record<string, string> = { 'active': 'success', 'on-leave': 'warning', 'terminated': 'danger' };
      return map[value] || 'secondary';
    }, formatter: (w) => w.status?.replace('-', ' ') || '-' },
  ];

  workerActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  emptyForm(): any {
    return { fullName: '', email: '', phone: '', department: '', position: '', hireDate: '', salary: 0, status: 'active', idNumber: '', address: '', emergencyContact: '' };
  }

  loadWorkers(): void {
    this.api.getWorkers({ status: this.filterStatus, department: this.filterDept, search: this.searchTerm }).subscribe({
      next: (data: any) => {
        this.workers = data;
        this.totalPages = Math.ceil(this.workers.length / this.itemsPerPage);
        this.currentPage = 1;
      },
    });
  }

  get paginatedWorkers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.workers.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onWorkerTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editWorker(event.row);
    if (event.action === 'delete') this.deleteWorker(event.row.id);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadWorkers(), 300);
  }

  openModal(): void {
    this.editing = false;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  editWorker(w: any): void {
    this.editing = true;
    this.editingId = w.id;
    this.form = { ...w };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveWorker(): void {
    const obs = this.editing
      ? this.api.updateWorker(this.editingId, this.form)
      : this.api.createWorker(this.form);

    obs.subscribe({
      next: () => { this.closeModal(); this.loadWorkers(); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving worker'),
    });
  }

  deleteWorker(id: number): void {
    if (confirm('Delete this worker?')) {
      this.api.deleteWorker(id).subscribe({ next: () => this.loadWorkers() });
    }
  }
}
