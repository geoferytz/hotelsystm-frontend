import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css'],
})
export class ShiftsComponent implements OnInit {
  shifts: any[] = [];
  users: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  filterStatus = '';
  filterDate = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  form: any = { userId: '', shiftType: 'morning', date: '', startTime: '08:00', endTime: '16:00', status: 'scheduled', notes: '' };
  Math = Math;

  shiftColumns: SharedTableColumn[] = [
    { key: 'User.username', label: 'Staff Member', sortable: true, formatter: (s) => s.User?.username || '-' },
    { key: 'shiftType', label: 'Shift Type', sortable: true, formatter: (s) => `<span class="badge bg-info text-dark">${s.shiftType}</span>` },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'startTime', label: 'Start Time', sortable: true },
    { key: 'endTime', label: 'End Time', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (value) => {
      const map: Record<string, string> = { 'scheduled': 'info', 'in-progress': 'primary', 'completed': 'success', 'cancelled': 'danger' };
      return map[value] || 'secondary';
    }, formatter: (s) => s.status?.replace('-', ' ') || '-' },
  ];

  shiftActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  loadShifts(): void {
    this.api.getShifts({ status: this.filterStatus, date: this.filterDate }).subscribe({
      next: (data: any) => {
        this.shifts = data;
        this.totalPages = Math.ceil(this.shifts.length / this.itemsPerPage);
        this.currentPage = 1;
      },
    });
  }

  get paginatedShifts(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.shifts.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onShiftTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editShift(event.row);
    if (event.action === 'delete') this.deleteShift(event.row.id);
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

  openModal(): void {
    this.editing = false;
    this.form = { userId: '', shiftType: 'morning', date: '', startTime: '08:00', endTime: '16:00', status: 'scheduled', notes: '' };
    this.api.getUsers().subscribe({ next: (data: any) => this.users = data });
    this.showModal = true;
  }

  editShift(s: any): void {
    this.editing = true;
    this.editingId = s.id;
    this.form = { ...s };
    this.api.getUsers().subscribe({ next: (data: any) => this.users = data });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveShift(): void {
    const obs = this.editing
      ? this.api.updateShift(this.editingId, this.form)
      : this.api.createShift(this.form);

    obs.subscribe({
      next: () => { this.closeModal(); this.loadShifts(); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving shift'),
    });
  }

  deleteShift(id: number): void {
    if (confirm('Delete this shift?')) {
      this.api.deleteShift(id).subscribe({ next: () => this.loadShifts() });
    }
  }
}
